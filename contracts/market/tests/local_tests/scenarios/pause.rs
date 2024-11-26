use crate::utils::TestBaseAsset;
use crate::utils::{setup, TestData};
use chrono::Utc;
use fuels::prelude::ViewOnlyAccount;
use market::PauseConfiguration;
use market::PriceDataUpdate;
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
        oracle,
        price_feed_ids,
        assets,
        publish_time,
        prices,
        ..
    } = setup(None, TestBaseAsset::USDC).await;

    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

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
        .withdraw_base(&[&oracle.instance], amount, &price_data_update)
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

    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.7) as u64;
    let prices = Vec::from([(
        uni.price_feed_id,
        (
            new_price,
            uni.price_feed_decimals,
            res.publish_time,
            res.confidence,
        ),
    )]);
    oracle.update_prices(&prices).await.unwrap();

    // New `price_data_update` that will be used in the next steps
    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids: vec![uni.price_feed_id],
        publish_times: vec![tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], alice_account)
            .await
            .unwrap()
            .value
    );

    market
        .with_account(&bob)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![alice_account], &price_data_update)
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
            &[&oracle.instance],
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
            &[&oracle.instance],
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

    let price = oracle.price(uni.price_feed_id).await.unwrap().value;
    let amount = parse_units(5, uni.price_feed_decimals.into()); // 1 UNI = $5
    oracle
        .update_prices(&Vec::from([(
            uni.price_feed_id,
            (
                amount,
                uni.price_feed_decimals,
                price.publish_time,
                price.confidence,
            ),
        )]))
        .await
        .unwrap();
    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    assert!(res.price == amount);

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
        .withdraw_base(&[&oracle.instance], amount, &price_data_update)
        .await
        .is_err();
    assert!(res);

    // Alice calls withdraw_collateral

    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.asset_id,
            amount,
            &price_data_update,
        )
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![alice_account], &price_data_update)
        .await
        .is_err();
    assert!(res);

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
            &[&oracle.instance],
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
            &[&oracle.instance],
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
