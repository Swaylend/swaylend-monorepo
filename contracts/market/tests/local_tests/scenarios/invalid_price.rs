use crate::utils::{setup, TestBaseAsset, TestData};
use fuels::{programs::calls::ContractDependency, types::U256};
use market::{OracleAssetConfiguration, OracleGlobalConfiguration};

#[tokio::test]
async fn reverts_when_all_oracles_are_disabled_globaly() {
    let TestData {
        admin,
        usdc,
        market,
        oracle_total_update_fee,
        pyth_mock_oracle,
        stork_mock_oracle,
        oracle_inputs,
        ..
    } = setup(None, TestBaseAsset::USDC, Some("tokens-stork.json")).await;

    let oracle_contracts: Vec<&dyn ContractDependency> =
        vec![&stork_mock_oracle.instance, &pyth_mock_oracle.instance];

    // Update price feeds
    market
        .update_price_feeds(&oracle_contracts, &oracle_inputs, oracle_total_update_fee)
        .await
        .unwrap();

    let usdc_price = market
        .get_price(&oracle_contracts, usdc.asset_id)
        .await
        .unwrap()
        .value;

    assert!(U256::from(usdc_price.price) == U256::from(1 * 10_u64.pow(usdc_price.exponent)));

    // Get global oracle configurations
    let global_oracle_configurations = market
        .get_oracle_global_configurations()
        .await
        .unwrap()
        .value;

    // Disable all oracles
    for (id, oracle_configuration) in global_oracle_configurations.iter().enumerate() {
        market
            .with_account(&admin)
            .await
            .unwrap()
            .update_global_oracle(
                id as u64,
                &OracleGlobalConfiguration {
                    is_disabled: true,
                    contract_id: oracle_configuration.contract_id,
                    oracle_type: oracle_configuration.oracle_type.clone(),
                },
            )
            .await
            .unwrap();
    }

    // Try to get price
    let res = market
        .get_price(&oracle_contracts, usdc.asset_id)
        .await
        .unwrap_err();
    assert!(res.to_string().contains("OracleNoValidPrice"));
}

#[tokio::test]
async fn reverts_when_all_oracles_are_disabled_for_asset() {
    let TestData {
        admin,
        usdc,
        market,
        oracle_total_update_fee,
        pyth_mock_oracle,
        stork_mock_oracle,
        oracle_inputs,
        ..
    } = setup(None, TestBaseAsset::USDC, Some("tokens-stork.json")).await;

    let oracle_contracts: Vec<&dyn ContractDependency> =
        vec![&stork_mock_oracle.instance, &pyth_mock_oracle.instance];

    // Update price feeds
    market
        .update_price_feeds(&oracle_contracts, &oracle_inputs, oracle_total_update_fee)
        .await
        .unwrap();

    let usdc_price = market
        .get_price(&oracle_contracts, usdc.asset_id)
        .await
        .unwrap()
        .value;

    assert!(U256::from(usdc_price.price) == U256::from(1 * 10_u64.pow(usdc_price.exponent)));

    // Get global oracle configurations
    let oracle_asset_configurations = market
        .get_oracle_asset_configurations()
        .await
        .unwrap()
        .value;

    let usdc_oracle_configurations = oracle_asset_configurations
        .iter()
        .find(|(asset_id, _)| *asset_id == usdc.asset_id)
        .unwrap()
        .1
        .clone();

    // Disable all oracles
    for oracle_configuration in usdc_oracle_configurations.iter() {
        market
            .with_account(&admin)
            .await
            .unwrap()
            .update_asset_oracle(
                usdc.asset_id,
                &OracleAssetConfiguration {
                    is_disabled: true,
                    oracle_id: oracle_configuration.oracle_id,
                    price_feed_id: oracle_configuration.price_feed_id.clone(),
                },
            )
            .await
            .unwrap();
    }

    // Try to get price
    let res = market
        .get_price(&oracle_contracts, usdc.asset_id)
        .await
        .unwrap_err();
    assert!(res.to_string().contains("OracleNoValidPrice"));
}
