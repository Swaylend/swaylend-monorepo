// **Scenario #12 - Collateral asset price increases**

// Description: Check that if collateral asset price increases, you can now borrow more base asset.
use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use chrono::Utc;
use fuels::accounts::ViewOnlyAccount;
use market::PriceDataUpdate;
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
        assets,
        usdc,
        eth,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        usdc_contract,
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
        .available_to_borrow(&[&oracle.instance], bob_account)
        .await
        .unwrap();
    let log_amount_before = format!("{} USDC", max_borrow_amount_before as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount_before.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            max_borrow_amount_before.try_into().unwrap(),
            &price_data_update,
        )
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
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
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 1.5) as u64;
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
        update_fee: 0,
        price_feed_ids: vec![eth.price_feed_id],
        publish_times: vec![tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    println!(
        "🔺 ETH price increases: ${}  -> ${}",
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
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: <MAX HE CAN BORROW AFTER PRICE INCREASE>
    let max_borrow_amount_after = market
        .available_to_borrow(&[&oracle.instance], bob_account)
        .await
        .unwrap();
    let log_amount_after = format!("{} USDC", max_borrow_amount_after as f64 / SCALE_6);
    print_case_title(4, "Bob", "withdraw_base", &log_amount_after.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            max_borrow_amount_after.try_into().unwrap(),
            &price_data_update,
        )
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == (max_borrow_amount_before + max_borrow_amount_after) as u64);
    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
