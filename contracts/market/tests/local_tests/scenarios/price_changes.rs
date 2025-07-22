// **Scenario #12 - Collateral asset price increases**

// Description: Check that if collateral asset price increases, you can now borrow more base asset.
use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::{accounts::ViewOnlyAccount, programs::calls::ContractDependency, types::Bits256};
use market::{OracleInput, PythOracleInput};
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;

#[tokio::test]
async fn price_changes() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        market,
        usdc,
        eth,
        mut oracle_inputs,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        oracle_total_update_fee,
        usdc_contract,
        ..
    } = setup(None, TestBaseAsset::USDC, None).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 30000.00 USDC
    let alice_supply_amount = parse_units(30000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(31000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_supply_log_amount = format!("{} USDC", alice_supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", alice_supply_log_amount.as_str());
    println!("💸 Alice + {alice_supply_log_amount}");
    usdc_contract
        .mint(alice_account, alice_mint_amount)
        .await
        .unwrap();
    let balance: u64 = alice
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == alice_mint_amount);

    let alice_supply_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, alice_supply_amount)
        .await;
    assert!(alice_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_collateral
    // 💰 Amount: 1.00 ETH (Bob has 1.00 ETH)
    let bob_supply_amount = parse_units(1 * AMOUNT_COEFFICIENT, eth.decimals);
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    let bob_user_collateral = market
        .get_user_collateral(bob_account, eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(bob_user_collateral == bob_supply_amount);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: <MAX HE CAN BORROW>
    let max_borrow_amount_before = market
        .available_to_borrow(&oracle_contracts, bob_account)
        .await
        .unwrap();
    let log_amount_before = format!("{} USDC", max_borrow_amount_before as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount_before.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            max_borrow_amount_before.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance: u64 = bob
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == max_borrow_amount_before as u64);
    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Increase ETH price
    // 💰 Amount: +50%
    print_case_title(3, "Admin", "Increase of ETH price", "+50%");
    let old_price = market
        .get_price(&oracle_contracts, eth.asset_id)
        .await
        .unwrap()
        .value;

    let (eth_price_feed_id, eth_price_feed_decimals) =
        pyth_asset_price_feeds.get(&eth.asset_id).unwrap();
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
                                    if *price_feed_id == *eth_price_feed_id {
                                        (*price as f64 * 1.5) as u64
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
        .get_price(&oracle_contracts, eth.asset_id)
        .await
        .unwrap()
        .value;

    println!(
        "🔺 ETH price increases: ${}  -> ${}",
        old_price.price as f64 / 10_u64.pow(*eth_price_feed_decimals) as f64,
        new_price.price as f64 / 10_u64.pow(*eth_price_feed_decimals) as f64
    );

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: <MAX HE CAN BORROW AFTER PRICE INCREASE>
    let max_borrow_amount_after = market
        .available_to_borrow(&oracle_contracts, bob_account)
        .await
        .unwrap();

    let log_amount_after = format!("{} USDC", max_borrow_amount_after as f64 / SCALE_6);
    print_case_title(4, "Bob", "withdraw_base", &log_amount_after.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            max_borrow_amount_after.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance: u64 = bob
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == (max_borrow_amount_before + max_borrow_amount_after) as u64);
    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
