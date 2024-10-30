use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::accounts::ViewOnlyAccount;
use market::PriceDataUpdate;
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn collateral_borrow_test() {
    let TestData {
        wallets,
        bob,
        bob_account,
        alice,
        alice_account,
        market,
        assets,
        usdc,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        usdc_contract,
        uni,
        uni_contract,
        ..
    } = setup(None, TestBaseAsset::USDC).await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 5000.00 USDC
    let alice_supply_amount = parse_units(5000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(10_000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_supply_log_amount = format!("{} USDC", alice_supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", alice_supply_log_amount.as_str());
    println!("💸 Alice + {alice_supply_log_amount}");
    usdc_contract
        .mint(alice_account, alice_mint_amount)
        .await
        .unwrap();
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
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
    // 💰 Amount: 40.00 UNI ~ $200.00
    let bob_mint_amount = parse_units(50 * AMOUNT_COEFFICIENT, uni.decimals);
    let bob_supply_amount = parse_units(40 * AMOUNT_COEFFICIENT, uni.decimals);
    let bob_mint_log_amount = format!("{} UNI", bob_mint_amount as f64 / SCALE_9);
    print_case_title(1, "Bob", "supply_collateral", bob_mint_log_amount.as_str());
    println!("💸 Bob + {bob_mint_log_amount}");
    uni_contract
        .mint(bob_account, bob_mint_amount)
        .await
        .unwrap();
    let bob_balance = bob.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(bob_balance == bob_mint_amount);
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    let bob_user_collateral = market
        .get_user_collateral(bob_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(bob_user_collateral == bob_supply_amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 150.00 USDC
    let amount_to_fail = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let withdraw_base_fail = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount_to_fail, &price_data_update)
        .await;
    assert!(withdraw_base_fail.is_err());

    let amount = parse_units(70 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount, &price_data_update)
        .await;
    assert!(bob_withdraw_res.is_ok());
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 150.00 USDC
    let bob_repay_amount = parse_units(60 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_collateral_amount = parse_units(40 * AMOUNT_COEFFICIENT, uni.decimals);
    let log_amount = format!("{} USDC", bob_repay_amount as f64 / SCALE_6);

    // Bob cannot repay and leave less than BASE_BORROW_MIN USDC
    let amount_to_fail = parse_units(65 * AMOUNT_COEFFICIENT, usdc.decimals);
    let repay_fail = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount_to_fail)
        .await;
    assert!(repay_fail.is_err());

    print_case_title(3, "Bob", "supply_base", &log_amount.as_str());
    let repay_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, bob_repay_amount)
        .await;
    assert!(repay_res.is_ok());
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    let withdraw_collateral_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.asset_id,
            bob_collateral_amount,
            &price_data_update,
        )
        .await;
    // it should fail because bob has not repayed everything yet
    assert!(withdraw_collateral_res.is_err());

    // repay the remaining 50 USDC
    let amount = parse_units(10 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_repay_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await;
    assert!(bob_repay_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 40.00 UNI
    let bob_withdraw_amount = market
        .get_user_collateral(bob_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    let bob_withdraw_amount_fail = parse_units(41 * AMOUNT_COEFFICIENT, uni.decimals);
    let log_amount = format!("{} UNI", bob_withdraw_amount as f64 / SCALE_9);
    print_case_title(3, "Bob", "withdraw_collateral", &log_amount.as_str());

    let withdraw_collateral_fail_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.asset_id,
            bob_withdraw_amount_fail,
            &price_data_update,
        )
        .await;
    assert!(withdraw_collateral_fail_res.is_err());

    usdc_contract
        .mint(bob_account, alice_mint_amount)
        .await
        .unwrap();

    let withdraw_collateral_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.asset_id,
            bob_withdraw_amount.try_into().unwrap(),
            &price_data_update,
        )
        .await;

    assert!(withdraw_collateral_res.is_ok());
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
}

#[tokio::test]
async fn collateral_borrow_timeskip_test() {
    let TestData {
        wallets,
        bob,
        bob_account,
        alice,
        alice_account,
        market,
        assets,
        usdc,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        usdc_contract,
        uni,
        uni_contract,
        ..
    } = setup(None, TestBaseAsset::USDC).await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 5000.00 USDC
    let alice_supply_amount = parse_units(5000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(10_000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_supply_log_amount = format!("{} USDC", alice_supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", alice_supply_log_amount.as_str());
    println!("💸 Alice + {alice_supply_log_amount}");
    usdc_contract
        .mint(alice_account, alice_mint_amount)
        .await
        .unwrap();
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
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
    // 💰 Amount: 40.00 UNI ~ $200.00
    let bob_mint_amount = parse_units(50 * AMOUNT_COEFFICIENT, uni.decimals);
    let bob_supply_amount = parse_units(40 * AMOUNT_COEFFICIENT, uni.decimals);
    let bob_mint_log_amount = format!("{} UNI", bob_mint_amount as f64 / SCALE_9);
    print_case_title(1, "Bob", "supply_collateral", bob_mint_log_amount.as_str());
    println!("💸 Bob + {bob_mint_log_amount}");
    uni_contract
        .mint(bob_account, bob_mint_amount)
        .await
        .unwrap();
    let bob_balance = bob.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(bob_balance == bob_mint_amount);
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    let bob_user_collateral = market
        .get_user_collateral(bob_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(bob_user_collateral == bob_supply_amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 150.00 USDC
    let amount = parse_units(70 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount, &price_data_update)
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    for _ in 0..100 {
        market.debug_increment_timestamp().await.unwrap();
    }

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 151.00 USDC
    usdc_contract
        .mint(
            bob_account,
            parse_units(1 * AMOUNT_COEFFICIENT, usdc.decimals),
        )
        .await
        .unwrap();
    let bob_repay_amount = parse_units(71 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", bob_repay_amount as f64 / SCALE_6);
    print_case_title(3, "Bob", "supply_base", &log_amount.as_str());
    let repay_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, bob_repay_amount)
        .await;
    assert!(repay_res.is_ok());

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 40.00 UNI
    let bob_withdraw_amount = market
        .get_user_collateral(bob_account, uni.asset_id)
        .await
        .unwrap()
        .value;

    let log_amount = format!("{} UNI", bob_withdraw_amount as f64 / SCALE_9);
    print_case_title(3, "Bob", "withdraw_collateral", &log_amount.as_str());

    usdc_contract
        .mint(bob_account, alice_mint_amount)
        .await
        .unwrap();

    let withdraw_collateral_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.asset_id,
            bob_withdraw_amount,
            &price_data_update,
        )
        .await;

    assert!(withdraw_collateral_res.is_ok());
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
}
