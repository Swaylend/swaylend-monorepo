// **Scenario #13 - Utilization above supply and borrow kinks**

// Description: Test if supply and borrow rates increases very fast (exponentially) when utilization is above supply and borrow kinks.

// Code: <insert link to the test file>

// Steps:
use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::{accounts::ViewOnlyAccount, types::U256};
use market::PriceDataUpdate;
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn utilization_above_kinks() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        market,
        usdc,
        usdc_contract,
        oracle,
        price_feed_ids,
        eth,
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
    // 💰 Amount: 10000.00 USDC
    let alice_supply_amount = parse_units(10000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(20000 * AMOUNT_COEFFICIENT, usdc.decimals);
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
    // 💰 Amount: 1 ETH (Bob has 1 ETH)
    let bob_supply_amount = parse_units(5 * AMOUNT_COEFFICIENT, eth.decimals);
    let bob_mint_log_amount = format!("{} ETH", bob_supply_amount as f64 / SCALE_9);
    print_case_title(1, "Bob", "supply_collateral", bob_mint_log_amount.as_str());
    println!("💸 Bob + {bob_mint_log_amount}");
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 9500.00 USDC
    let bob_borrow_amount = parse_units(9500 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_borrow_log_amount = format!("{} USDC", bob_borrow_amount as f64 / SCALE_6);
    print_case_title(1, "Bob", "withdraw_base", bob_borrow_log_amount.as_str());
    println!("💸 Bob - {bob_borrow_log_amount}");
    let bob_borrow_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], bob_borrow_amount, &price_data_update)
        .await;
    assert!(bob_borrow_res.is_ok(), "{:?}", bob_borrow_res.err());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: get_utilization
    // 💰 Check Utilization
    let utilization = market.get_utilization().await.unwrap();
    println!("📈 Utilization: {}", utilization);

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Check supply and borrow rates
    // 💰 Check Rates
    let supply_rate = market
        .get_supply_rate(utilization.try_into().unwrap())
        .await
        .unwrap();
    let borrow_rate = market
        .get_borrow_rate(utilization.try_into().unwrap())
        .await
        .unwrap();
    println!("📈 Supply Rate: {}", supply_rate);
    println!("📈 Borrow Rate: {}", borrow_rate);

    // Check if utilization is above kinks and rates are high
    let market_config = market.get_market_configuration().await.unwrap().value;
    assert!(U256::from(utilization) > market_config.supply_kink);
    assert!(U256::from(utilization) > market_config.borrow_kink);
    assert!(U256::from(utilization) > market_config.supply_per_second_interest_rate_base);
    assert!(U256::from(utilization) > market_config.borrow_per_second_interest_rate_base);

    market
        .print_debug_state(&wallets, &usdc, &usdc)
        .await
        .unwrap();
}
