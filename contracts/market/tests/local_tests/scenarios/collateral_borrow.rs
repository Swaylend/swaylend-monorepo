// **Scenario #2 - Supply collateral asset, borrow base asset, repay, withdraw collateral asset**

// Description: User supply collateral asset and borrows base asset.

// Code: <insert link to the test file>

// Steps:

// - User A supplies 5000 USDC
// - User B supplies 40 UNI
// - User B borrows 1000 USDC
// - User B repays 1000 USDC
// - User B withdraws 40 UNI

// **Scenario #4 - Scenario #2 with time passed**

// Description: Same as scenario #2 but between steps 3 and 4 a lot of time passes so borrower should repay more base asset.

// Code: <insert link to the test file>

// Steps:

use crate::utils::{print_case_title, setup, TestData};
use fuels::{
    accounts::ViewOnlyAccount,
    types::{ContractId, U256},
};
use market::{CollateralConfiguration, PauseConfiguration, PriceDataUpdate};
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn collateral_borrow_test() {
    let TestData {
        wallets,
        admin,
        admin_address,
        bob,
        bob_address,
        alice,
        alice_address,
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
    } = setup().await;

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
        .mint(alice_address, alice_mint_amount)
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
        .mint(bob_address, bob_mint_amount)
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
        .get_user_collateral(bob_address, uni.bits256)
        .await
        .unwrap();
    assert!(bob_user_collateral == bob_supply_amount as u128);

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

    let amount = parse_units(150 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount.as_str());
    market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount, &price_data_update)
        .await
        .unwrap();
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 150.00 USDC
    let bob_repay_amount = parse_units(100 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_collateral_amount = parse_units(40 * AMOUNT_COEFFICIENT, uni.decimals);
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

    let withdraw_collateral_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.bits256,
            bob_collateral_amount,
            &price_data_update,
        )
        .await;
    // it shouldnt be ok because bob hasnt repayed everything yet
    assert!(withdraw_collateral_res.is_err());

    // repay the remaining 50 USDC
    let amount = parse_units(50 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_repay_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await;
    assert!(bob_repay_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 40.00 UNI
    let bob_withdraw_amount = market
        .get_user_collateral(bob_address, uni.bits256)
        .await
        .unwrap();
    let bob_withdraw_amount_fail = parse_units(41 * AMOUNT_COEFFICIENT, uni.decimals);
    let log_amount = format!("{} UNI", bob_withdraw_amount as f64 / SCALE_9);
    print_case_title(3, "Bob", "withdraw_collateral", &log_amount.as_str());

    let withdraw_collateral_fail_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.bits256,
            bob_withdraw_amount_fail,
            &price_data_update,
        )
        .await;
    assert!(withdraw_collateral_fail_res.is_err());

    usdc_contract
        .mint(bob_address, alice_mint_amount)
        .await
        .unwrap();

    let withdraw_collateral_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_collateral(
            &[&oracle.instance],
            uni.bits256,
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
