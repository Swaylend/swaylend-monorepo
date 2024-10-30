use crate::utils::{setup, TestBaseAsset, TestData};
use fuels::types::U256;
use market::{CollateralConfiguration, MarketConfiguration, PriceDataUpdate};
use market_sdk::parse_units;

#[tokio::test]
async fn collateral_configuration_test() {
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

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    usdc_contract
        .mint(alice_account, parse_units(10000, usdc.decimals))
        .await
        .unwrap();

    usdc_contract
        .mint(bob_account, parse_units(10000, usdc.decimals))
        .await
        .unwrap();

    // Bob supplies 1 ETH
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
        .available_to_borrow(&[&oracle.instance], bob_account)
        .await
        .unwrap();
    println!("Bob available_to_borrow: {:?}", res);

    market
        .print_debug_state(&wallets, &usdc, &eth)
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

    println!(
        "Bob available_to_borrow: {:?}",
        market
            .with_account(&bob)
            .await
            .unwrap()
            .available_to_borrow(&[&oracle.instance], bob_account)
            .await
            .unwrap()
    );

    // Bob withdraws 2800 USDC, and tries to withdraw another 1 USDC but cant because of the collateral factor
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
    // Fails because Bob cant borrow anymore
    assert!(res.is_err());

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // change collat config for eth
    let config = collateral_config
        .iter_mut()
        .find(|config: &&mut CollateralConfiguration| config.asset_id == eth.asset_id);

    let config = match config {
        Some(config) => config,
        None => panic!("Collateral configuration not found"),
    };

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
        .available_to_borrow(&[&oracle.instance], bob_account)
        .await
        .unwrap();
    // Res should equal 350 USDC because of the new collateral factor
    assert!(res == parse_units(350, usdc.decimals) as u128);
}

#[tokio::test]
async fn market_configuration_test() {
    let TestData {
        admin,
        market,
        usdc,
        ..
    } = setup(None, TestBaseAsset::USDC).await;

    let old_market_config = market.get_market_configuration().await.unwrap().value;
    let new_market_config = MarketConfiguration {
        supply_kink: 900000000000000000u64.into(),
        borrow_kink: 900000000000000000u64.into(),
        supply_per_second_interest_rate_slope_low: 1141552514.into(),
        supply_per_second_interest_rate_slope_high: 50735667178u64.into(),
        supply_per_second_interest_rate_base: 1.into(),
        borrow_per_second_interest_rate_slope_low: 1585489600.into(),
        borrow_per_second_interest_rate_slope_high: 57077625573u64.into(),
        borrow_per_second_interest_rate_base: 475646880.into(),
        store_front_price_factor: 700000000000000000u64.into(),
        base_tracking_index_scale: 1000000000000000u64.into(),
        base_tracking_supply_speed: 1.into(),
        base_tracking_borrow_speed: 1.into(),
        base_min_for_rewards: 2000000000.into(),
        base_borrow_min: 2000.into(),
        target_reserves: 2000000000000u64.into(),
        base_token: usdc.asset_id,
        base_token_decimals: usdc.decimals.try_into().unwrap(),
        base_token_price_feed_id: usdc.price_feed_id,
    };

    let res = market
        .with_account(&admin)
        .await
        .unwrap()
        .update_market_configuration(&new_market_config)
        .await;

    assert!(res.is_ok());

    let market_config = market.get_market_configuration().await.unwrap().value;
    assert!(market_config == new_market_config);
    assert!(market_config != old_market_config);
}
