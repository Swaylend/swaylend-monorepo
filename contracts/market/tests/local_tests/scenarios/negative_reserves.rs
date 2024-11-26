use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use chrono::Utc;
use fuels::accounts::ViewOnlyAccount;
use market::PriceDataUpdate;
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn negative_reserves_test() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        chad,
        market,
        usdc,
        usdc_contract,
        eth,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        assets,
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
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 1000.00 USDC
    let alice_supply_amount = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(2000 * AMOUNT_COEFFICIENT, usdc.decimals);
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
    // 💰 Amount: 1.00 ETH
    let bob_supply_amount = parse_units(1 * AMOUNT_COEFFICIENT, eth.decimals);
    let bob_mint_log_amount = format!("{} ETH", bob_supply_amount as f64 / SCALE_9);
    print_case_title(1, "Bob", "supply_collateral", bob_mint_log_amount.as_str());
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 1000.00 USDC
    let bob_borrow_amount = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_borrow_log_amount = format!("{} USDC", bob_borrow_amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", bob_borrow_log_amount.as_str());
    println!("💸 Bob - {bob_borrow_log_amount}");
    let bob_borrow_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], bob_borrow_amount, &price_data_update)
        .await;
    assert!(bob_borrow_res.is_ok(), "{:?}", bob_borrow_res.err());

    market.debug_increment_timestamp().await.unwrap();

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of ETH price
    // 💰 Amount: -70%
    print_case_title(3, "Admin", "Drop of ETH price", "-70%");
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.3) as u64;
    let prices = Vec::from([(
        eth.price_feed_id,
        (
            new_price,
            eth.price_feed_decimals,
            res.publish_time,
            res.confidence,
        ),
    )]);

    oracle.update_prices(&prices).await.unwrap();

    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids: vec![eth.price_feed_id],
        publish_times: vec![tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    println!(
        "🔻 ETH price drops: ${}  -> ${}",
        res.price as f64 / 10_u64.pow(eth.price_feed_decimals) as f64,
        new_price as f64 / 10_u64.pow(eth.price_feed_decimals) as f64
    );
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: absorb
    // 🔥 Target: Bob
    print_case_title(4, "Chad", "absorb", "Bob");

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], bob_account)
            .await
            .unwrap()
            .value
    );

    market
        .with_account(&chad)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![bob_account], &price_data_update)
        .await
        .unwrap();

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(bob_account, eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 1000.00 USDC
    let alice_withdraw_amount = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_withdraw_log_amount = format!("{} USDC", alice_withdraw_amount as f64 / SCALE_6);
    print_case_title(
        5,
        "Alice",
        "withdraw_base",
        alice_withdraw_log_amount.as_str(),
    );
    println!("💸 Alice - {alice_withdraw_log_amount}");
    let alice_withdraw_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            alice_withdraw_amount,
            &price_data_update,
        )
        .await;
    assert!(
        alice_withdraw_res.is_err(),
        "{:?}",
        alice_withdraw_res.err()
    );

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
