use crate::utils::TestBaseAsset;
use crate::utils::{setup, TestData};
use fuels::types::Bits256;
use fuels::{accounts::ViewOnlyAccount, programs::calls::ContractDependency};
use market::{OracleInput, PauseConfiguration, PythOracleInput};
use market_sdk::convert_i256_to_u64;
use market_sdk::is_i256_negative;
use market_sdk::parse_units;

#[tokio::test]
async fn pause_test() {
    let TestData {
        admin,
        alice,
        alice_account,
        bob,
        bob_account,
        usdc_contract,
        usdc,
        market,
        uni,
        uni_contract,
        mut oracle_inputs,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        oracle_total_update_fee,
        ..
    } = setup(None, TestBaseAsset::USDC, None).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 400.00 USDC

    let amount = parse_units(400, usdc.decimals);

    // Transfer of 400 USDC to the Bob's wallet
    usdc_contract.mint(bob_account, amount).await.unwrap();

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    // Bob calls supply_base
    market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 400 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(bob_account).await.unwrap();

    assert!(supply_balance == (amount as u128));

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 40.00 UNI ~ $200.00

    let amount = parse_units(40, uni.decimals);

    // Transfer of 40 UNI to the Alice's wallet
    uni_contract.mint(alice_account, amount).await.unwrap();

    let balance = alice.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == amount);

    // Alice calls supply_collateral
    market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 40 UNI
    let res = market
        .get_user_collateral(alice_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(res == amount);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 150.00 USDC

    let amount = parse_units(100, usdc.decimals);

    // Alice calls withdraw_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            amount,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // USDC balance check
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of collateral price
    // 💰 Amount: -30%

    let old_price = market
        .get_price(&oracle_contracts, uni.asset_id)
        .await
        .unwrap()
        .value;

    let (uni_price_feed_id, uni_price_feed_decimals) =
        pyth_asset_price_feeds.get(&uni.asset_id).unwrap();
    let old_oracle_inputs = oracle_inputs.clone();
    let mut new_oracle_inputs = Vec::new();

    for input in oracle_inputs.iter() {
        let input = input.clone();

        let processed_input = match input {
            OracleInput::Pyth(pyth_input) => {
                let new_prices = pyth_prices
                    .iter()
                    .map(
                        |(
                            price_feed_id,
                            (price, price_feed_decimals, publish_time, confidence),
                        )| {
                            (
                                *price_feed_id,
                                (
                                    if *price_feed_id == *uni_price_feed_id {
                                        (*price as f64 * 0.7) as u64
                                    } else {
                                        *price
                                    },
                                    *price_feed_decimals,
                                    *publish_time,
                                    *confidence,
                                ),
                            )
                        },
                    )
                    .collect::<Vec<(Bits256, (u64, u32, u64, u64))>>();

                OracleInput::Pyth(PythOracleInput {
                    contract_id: pyth_input.contract_id,
                    update_fee: pyth_input.update_fee,
                    publish_times: pyth_input.publish_times,
                    price_feed_ids: pyth_input.price_feed_ids,
                    update_data: pyth_mock_oracle
                        .create_update_data(&new_prices)
                        .await
                        .unwrap(),
                })
            }
            _ => input,
        };

        new_oracle_inputs.push(processed_input);
    }

    oracle_inputs = new_oracle_inputs;

    // Update price feeds
    market
        .update_price_feeds(&oracle_contracts, &oracle_inputs, oracle_total_update_fee)
        .await
        .unwrap();

    // Get new price
    let new_price = market
        .get_price(&oracle_contracts, uni.asset_id)
        .await
        .unwrap()
        .value;

    println!(
        "🔻 UNI price drops: ${}  -> ${}",
        old_price.price as f64 / 10_u64.pow(*uni_price_feed_decimals) as f64,
        new_price.price as f64 / 10_u64.pow(*uni_price_feed_decimals) as f64
    );

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    assert!(
        market
            .is_liquidatable(&oracle_contracts, alice_account)
            .await
            .unwrap()
            .value
    );

    market
        .with_account(&bob)
        .await
        .unwrap()
        .absorb(
            &oracle_contracts,
            vec![alice_account],
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(alice_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(alice_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(amount == 0);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: 172.44 USDC

    let reserves = market
        .with_account(&bob)
        .await
        .unwrap()
        .get_collateral_reserves(uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = market
        .collateral_value_to_sell(
            &oracle_contracts,
            uni.asset_id,
            convert_i256_to_u64(&reserves),
        )
        .await
        .unwrap()
        .value;

    // Transfer of amount to the wallet
    usdc_contract.mint(bob_account, amount).await.unwrap();

    // Сheck balance
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    // Bob calls buy_collateral
    market
        .with_account(&bob)
        .await
        .unwrap()
        .buy_collateral(
            &oracle_contracts,
            usdc.asset_id,
            amount as u64,
            uni.asset_id,
            1,
            bob_account,
        )
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #6 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Call: reset UNI price and pause

    market
        .update_price_feeds(
            &oracle_contracts,
            &old_oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    let pause_config = PauseConfiguration {
        supply_paused: true,
        withdraw_paused: true,
        absorb_paused: true,
        buy_paused: true,
    };

    // Expect error because of GOVERNOR check
    assert!(market
        .with_account(&alice)
        .await
        .unwrap()
        .pause(&pause_config)
        .await
        .is_err());

    market
        .with_account(&admin)
        .await
        .unwrap()
        .pause(&pause_config)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #7 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 400.00 USDC

    let amount = parse_units(400, usdc.decimals);

    // Transfer of 400 USDC to the Bob's wallet
    usdc_contract.mint(bob_account, amount).await.unwrap();

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    // Bob calls supply_base
    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #8 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 40.00 UNI ~ $200.00

    let amount = parse_units(40, uni.decimals);

    // Transfer of 40 UNI to the Alice's wallet
    uni_contract.mint(alice_account, amount).await.unwrap();

    let balance = alice.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == amount);

    // Alice calls supply_collateral
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, amount)
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #9 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 150.00 USDC

    let amount = parse_units(150, usdc.decimals);

    // Alice calls withdraw_base

    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            amount,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .is_err();
    assert!(res);

    // Alice calls withdraw_collateral

    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_collateral(
            &oracle_contracts,
            uni.asset_id,
            amount,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #10 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .absorb(
            &oracle_contracts,
            vec![alice_account],
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #11 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: 172.44 USDC

    let reserves = market
        .with_account(&bob)
        .await
        .unwrap()
        .get_collateral_reserves(uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = market
        .collateral_value_to_sell(
            &oracle_contracts,
            uni.asset_id,
            convert_i256_to_u64(&reserves),
        )
        .await
        .unwrap()
        .value;

    // Bob calls buy_collateral
    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .buy_collateral(
            &oracle_contracts,
            usdc.asset_id,
            amount,
            uni.asset_id,
            1,
            bob_account,
        )
        .await
        .is_err();
    assert!(res);
}
