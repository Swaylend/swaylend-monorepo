// **Scenario #10 - Change governor**

// Description: Change governor of smart contract and then try to call only governor methods.

// Code: <insert link to the test file>

// methods callable by governor:
//  1.	activate_contract(market_configuration: MarketConfiguration)
// 	2.	✅ add_collateral_asset(configuration: CollateralConfiguration)
// 	3.	✅ pause_collateral_asset(asset_id: b256)
// 	4.	✅ resume_collateral_asset(asset_id: b256)
// 	5.	✅ update_collateral_asset(asset_id: b256, configuration: CollateralConfiguration)
// 	6.	✅ withdraw_reserves(to: Address, amount: u256)
// 	7.	✅ pause(pause_config: PauseConfiguration)
// 	8.	set_pyth_contract_id(contract_id: ContractId)
// 	9.	update_market_configuration(configuration: MarketConfiguration)

// Steps:

use std::str::FromStr;

use crate::utils::{print_case_title, setup, TestData};
use chrono::Utc;
use fuels::{
    prelude::ViewOnlyAccount,
    types::{AssetId, Bits256, U256},
};
use market::{CollateralConfiguration, PauseConfiguration, PriceDataUpdate};
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn governor_test() {
    let TestData {
        wallets,
        admin,
        admin_address,
        alice,
        alice_address,
        bob,
        bob_address,
        chad,
        chad_address,
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
    } = setup().await;

    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    let asset_id = assets["ETH"].asset_id;

    let mock_collateral_config = CollateralConfiguration {
        asset_id: assets["USDC"].asset_id.into(),
        price_feed_id: assets["USDC"].price_feed_id,
        decimals: assets["USDC"].decimals.try_into().unwrap(),
        borrow_collateral_factor: U256::from(18), // decimals: 18
        liquidate_collateral_factor: U256::from(18), // decimals: 18
        liquidation_penalty: U256::from(18),      // decimals: 18
        supply_cap: U256::from(10),               // decimals: asset decimals
        paused: false,
    };

    let admin_add_collat_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .add_collateral_asset(&mock_collateral_config)
        .await;
    let alice_add_collat_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .add_collateral_asset(&mock_collateral_config)
        .await;
    // make sure add_collateral_asset was ok
    assert!(admin_add_collat_res.is_ok());
    assert!(!alice_add_collat_res.is_ok());

    let admin_pause_collat_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .pause_collateral_asset(asset_id)
        .await;
    let alice_pause_collat_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .pause_collateral_asset(asset_id)
        .await;
    // make sure pause_collateral_asset was ok
    assert!(admin_pause_collat_res.is_ok());
    assert!(!alice_pause_collat_res.is_ok());

    let admin_resume_collat_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .resume_collateral_asset(asset_id)
        .await;
    let alice_resume_collat_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .resume_collateral_asset(asset_id)
        .await;
    // make sure resume_collateral_asset was ok
    assert!(admin_resume_collat_res.is_ok());
    assert!(!alice_resume_collat_res.is_ok());

    let admin_update_collat_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .update_collateral_asset(asset_id, &mock_collateral_config)
        .await;
    let alice_update_collat_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .update_collateral_asset(asset_id, &mock_collateral_config)
        .await;
    // make sure update_collateral_asset was ok
    assert!(admin_update_collat_res.is_ok());
    assert!(!alice_update_collat_res.is_ok());

    let alice_withdraw_reserves_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_reserves(alice_address, 100_000_000)
        .await;
    let admin_withdraw_reserves_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .withdraw_reserves(admin_address, 0)
        .await;
    // make sure withdraw_reserves was ok
    assert!(!alice_withdraw_reserves_res.is_ok());
    // FIXME[urban]: assertion below should not fail, accrue reserves to actually withdraw them
    // assert!(admin_withdraw_reserves_res.is_ok());

    let pause_config = PauseConfiguration {
        supply_paused: true,
        withdraw_paused: true,
        absorb_paused: true,
        buy_paused: true,
    };

    let admin_pause_collat_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .pause(&pause_config)
        .await;
    let alice_pause_collat_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .pause(&pause_config)
        .await;
    // make sure pause_collateral_asset was ok
    assert!(admin_pause_collat_res.is_ok());
    assert!(!alice_pause_collat_res.is_ok());
}
