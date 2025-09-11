// methods callable by owner:
// 	1.	✅ add_collateral_asset(configuration: CollateralConfiguration)
// 	2.	✅ update_collateral_asset(asset_id: b256, configuration: CollateralConfiguration)
// 	3.	✅ withdraw_reserves(to: Address, amount: u256)
// 	4.	✅ pause(pause_config: PauseConfiguration)
// 	5.	✅ update_market_configuration(configuration: MarketConfiguration)
// additional tests for:
//  6.  ✅ transfer_ownership
//  7.  ✅ renounce_ownership

use crate::utils::{setup, TestBaseAsset, TestData};
use fuels::types::U256;
use market::{CollateralConfiguration, PauseConfiguration};
use market_sdk::get_market_config;

#[tokio::test]
async fn owner_test() {
    let TestData {
        admin,
        admin_account,
        alice,
        alice_account,
        bob,
        bob_account,
        market,
        assets,
        usdc,
        ..
    } = setup(None, TestBaseAsset::USDC, None).await;

    let asset_id = assets["ETH"].asset_id;

    let mock_collateral_config = CollateralConfiguration {
        asset_id: assets["USDC"].asset_id.into(),
        decimals: assets["USDC"].decimals.try_into().unwrap(),
        oracle_max_confidence_width: 300u64.into(),
        borrow_collateral_factor: U256::from(18), // decimals: 18
        liquidate_collateral_factor: U256::from(18), // decimals: 18
        liquidation_penalty: U256::from(18),      // decimals: 18
        supply_cap: 10,                           // decimals: asset decimals
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
    assert!(alice_add_collat_res.is_err());

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
    assert!(alice_update_collat_res.is_err());

    let alice_withdraw_reserves_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_reserves(alice_account, 100_000_000)
        .await;
    let admin_withdraw_reserves_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .withdraw_reserves(admin_account, 0)
        .await;

    // make sure withdraw_reserves was ok
    let err = alice_withdraw_reserves_res.unwrap_err();
    let err_str = format!("{:?}", err);
    assert!(err_str.contains("NotOwner"));
    let err = admin_withdraw_reserves_res.unwrap_err();
    let err_str = format!("{:?}", err);
    assert!(err_str.contains("TransferZeroCoins"));

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
    assert!(alice_pause_collat_res.is_err());

    let market_config = get_market_config(usdc.asset_id, usdc.decimals as u32).unwrap();

    let alice_update_market_configuration_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .update_market_configuration(&market_config)
        .await;
    let admin_update_market_configuration_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .update_market_configuration(&market_config)
        .await;
    // make sure update_market_configuration was ok
    assert!(alice_update_market_configuration_res.is_err());
    assert!(admin_update_market_configuration_res.is_ok());

    // 9. Test transfer ownership
    // Alice should not be able to transfer ownership
    let alice_transfer_ownership_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .transfer_ownership(bob_account)
        .await;
    assert!(alice_transfer_ownership_res.is_err());

    // Admin should be able to transfer ownership to Bob
    let admin_transfer_ownership_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .transfer_ownership(bob_account)
        .await;
    assert!(admin_transfer_ownership_res.is_ok());

    // Admin should not be able to update the market configuration
    let admin_update_market_configuration_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .update_market_configuration(&market_config)
        .await;
    assert!(admin_update_market_configuration_res.is_err());

    // Bob should be able to update the market configuration
    let bob_update_market_configuration_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .update_market_configuration(&market_config)
        .await;
    assert!(bob_update_market_configuration_res.is_ok());

    // 10. Bob should be able to renounce ownership
    let bob_renounce_ownership_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .renounce_ownership()
        .await;

    assert!(bob_renounce_ownership_res.is_ok());

    // Neither Admin nor Bob should be able to update the market configuration
    let admin_update_market_configuration_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .update_market_configuration(&market_config)
        .await;
    assert!(admin_update_market_configuration_res.is_err());

    let bob_update_market_configuration_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .update_market_configuration(&market_config)
        .await;

    assert!(bob_update_market_configuration_res.is_err());

    // After renouncing ownership, we should not be able to transfer ownership
    let admin_transfer_ownership_res = market
        .with_account(&admin)
        .await
        .unwrap()
        .transfer_ownership(alice_account)
        .await;
    assert!(admin_transfer_ownership_res.is_err());

    let bob_transfer_ownership_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .transfer_ownership(alice_account)
        .await;
    assert!(bob_transfer_ownership_res.is_err());
}
