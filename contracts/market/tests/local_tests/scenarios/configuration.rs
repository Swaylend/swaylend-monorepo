// **Scenario #7 - Change collateral configuration**

// Description: Change collateral configuration values (maybe not necessary to test all variables) and test borrowing, absorb, and liquidation.

// Code: <insert link to the test file>

// Steps:

// **Scenario #9 - Change market configuration**

// Description: Change each market configuration variable (maybe not necessary to test all variables) and call the functions that should change behavior.

// Code: <insert link to the test file>

// Steps:
use crate::utils::{setup, TestData};
use fuels::{
    accounts::ViewOnlyAccount,
    types::{bech32, AssetId, Bits256, U256},
};
use market::{CollateralConfiguration, MarketConfiguration, PriceDataUpdate};
use market_sdk::{format_units, get_market_config, parse_units, MarketContract};
use serde::de::IntoDeserializer;

const SCALE_6: f64 = 10u64.pow(6) as f64;

#[tokio::test]
async fn collateral_configuration_test() {
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
        eth,
        ..
    } = setup().await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    usdc_contract
        .mint(alice_address, parse_units(10000, usdc.decimals))
        .await
        .unwrap();

    usdc_contract
        .mint(bob_address, parse_units(10000, usdc.decimals))
        .await
        .unwrap();

    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, parse_units(1, eth.decimals))
        .await;
    assert!(res.is_ok(), "{:?}", res.err());

    let mut collateral_config: Vec<CollateralConfiguration> = market
        .with_account(&admin)
        .await
        .unwrap()
        .get_collateral_configurations()
        .await
        .unwrap()
        .value;

    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .available_to_borrow(&[&oracle.instance], bob_address)
        .await
        .unwrap();
    println!("Bob available_to_borrow: {:?}", res);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // change collat config for eth
    let config = collateral_config
        .iter_mut()
        .find(|config: &&mut CollateralConfiguration| config.asset_id == eth.bits256);

    let config = match config {
        Some(config) => config,
        None => panic!("Collateral configuration not found"),
    };

    // alice supplies 7000 USDC to the market
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, parse_units(7000, usdc.decimals))
        .await;
    assert!(res.is_ok());

    println!(
        "Bob available_to_borrow: {:?}",
        market
            .with_account(&bob)
            .await
            .unwrap()
            .available_to_borrow(&[&oracle.instance], bob_address)
            .await
            .unwrap()
    );

    // bob withdraws 2800 USDC, and tries to withdraw another 1 USDC but cant because of the collateral factor
    let amount = parse_units(2800, usdc.decimals);
    // Bob calls withdraw_base
    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            amount.try_into().unwrap(),
            &price_data_update,
        )
        .await;
    assert!(res.is_ok());

    let amount = parse_units(1, usdc.decimals);
    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            amount.try_into().unwrap(),
            &price_data_update,
        )
        .await;
    // fails because bob cant borrow anymore
    assert!(res.is_err());

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    config.borrow_collateral_factor = U256::from(parse_units(9, 17));
    config.liquidate_collateral_factor = U256::from(parse_units(8, 17));
    config.liquidation_penalty = U256::from(parse_units(9, 17));

    market
        .with_account(&admin)
        .await
        .unwrap()
        .update_collateral_asset(eth.asset_id, config)
        .await
        .unwrap();

    let res = market
        .available_to_borrow(&[&oracle.instance], bob_address)
        .await
        .unwrap();
    // res should equal 350 USDC because of the new collateral factor
    assert!(res == parse_units(350, usdc.decimals) as u128);
}

#[tokio::test]
async fn market_configuration_test() {}
