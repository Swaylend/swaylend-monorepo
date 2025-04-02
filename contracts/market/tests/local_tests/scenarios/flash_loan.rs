use crate::utils::{setup, TestBaseAsset, TestData};
use fuels::types::U256;
use market::{CollateralConfiguration, FlashLoanScript, MarketConfiguration, PriceDataUpdate};
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

    let bin_path = "../flash-loan/out/release/flash-loan.bin";

    let instance = FlashLoanScript::new(bob.clone(), bin_path);
    let response = instance.main().call().await.unwrap();

    let logs = response.decode_logs();
    println!("{:?}", logs);
}
