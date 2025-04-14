use crate::utils::{setup, TestBaseAsset, TestData};
use fuels::types::U256;
use market::{CollateralConfiguration, FlashLoanContract, MarketConfiguration, PriceDataUpdate};
use market_sdk::parse_units;
use std::process::Command;

#[tokio::test]
async fn flash_loan_test() {
    let TestData {
        wallets,
        admin,
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
        eth,
        flash_loaner,
        ..
    } = setup(None, TestBaseAsset::USDC).await;

    usdc_contract
        .mint(alice_account, parse_units(10000, usdc.decimals))
        .await
        .unwrap();

    // Alice supplies 7000 USDC
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, parse_units(7000, usdc.decimals))
        .await;
    assert!(res.is_ok());

    let result = flash_loaner
        .execute_operation(1000, alice_account, vec![])
        .await
        .unwrap();

    assert!(result);
}
