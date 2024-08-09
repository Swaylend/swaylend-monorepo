use market::PauseConfiguration;
use token_sdk::{TokenAsset, TokenContract};

use crate::utils::{setup, TestData};
use chrono::Utc;
use fuels::prelude::ViewOnlyAccount;
use fuels::types::{Address, Bits256, ContractId};
use market_sdk::{get_market_config, parse_units, MarketContract};
use pyth_mock_sdk::PythMockContract;

#[tokio::test]
async fn base_asset_test() {
    //     Scenario #1 - Supply and withdraw base
    // Description: Users supply base asset and withdraws it.
    // Code: <insert link to the test file>

    // Steps:
    // - User alice supplies 1000 USDC
    // - User alice withdraws 1000 USDC

    // Additional things to try: supply more than you have in wallet, withdraw more than you supplied
    let TestData {
        alice,
        bob,
        market,
        usdc,
        ..
    } = setup().await;

    // bob calls supply_base
    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, 50)
        .await
        .is_err();
}
