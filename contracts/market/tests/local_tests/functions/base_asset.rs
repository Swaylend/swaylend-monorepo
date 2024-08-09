use market::PauseConfiguration;
use token_sdk::{TokenAsset, TokenContract};

use crate::utils::{print_case_title, setup, TestData};
use chrono::Utc;
use fuels::prelude::ViewOnlyAccount;
use fuels::types::{Address, Bits256, ContractId};
use market_sdk::{get_market_config, parse_units, MarketContract};
use pyth_mock_sdk::PythMockContract;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn base_asset_test() {
    let TestData {
        wallets,
        alice,
        alice_address,
        bob,
        bob_address,
        usdc_contract,
        market,
        usdc,
        uni,
        oracle,
        ..
    } = setup().await;

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 1000.00 USDC
    let mint_amount = parse_units(1000, usdc.decimals);
    // transfer of 1000 USDC to the Alice's wallet
    usdc_contract
        .mint(alice_address, mint_amount)
        .await
        .unwrap();

    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == mint_amount);

    // Alice calls supply_base with more than she has, results in tx revert
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, mint_amount + 1)
        .await;
    assert!(res.is_err());

    // Alice calls supply_base and deposits 500 USDC
    let supply_amount = parse_units(500, usdc.decimals);
    let supply_log_amount = format!("{} USDC", supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", supply_log_amount.as_str());
    market.debug_increment_timestamp().await.unwrap();
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, supply_amount)
        .await;
    // make sure supply_base was ok
    assert!(res.is_ok());
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();
    // Alice calls witdraw_base with more than she has supplied, results in tx revert
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], (supply_amount + 1).try_into().unwrap())
        .await;
    // make sure withdraw_base was reverted
    assert!(res.is_err());

    // Alice calls withdraw_base and withdraws 500 USDC
    let withdraw_amount = supply_amount;
    let withdraw_log_amount = format!("{} USDC", withdraw_amount as f64 / SCALE_6);
    print_case_title(1, "Alice", "withdraw_base", withdraw_log_amount.as_str());
    market.debug_increment_timestamp().await.unwrap();
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], withdraw_amount.try_into().unwrap())
        .await;
    // make sure withdraw_base was ok
    assert!(res.is_ok());

    market.debug_increment_timestamp().await.unwrap();
    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
}
