use fuels::{
    test_helpers::{launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig},
    types::Bits256,
};

use stork_mock::{TemporalNumericValueInput, I128};
use stork_mock_sdk::StorkMockContract;

#[tokio::test]
async fn update_and_get_price() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let stork_mock = StorkMockContract::deploy(owner).await.unwrap();

    let price_feed_id =
        Bits256::from_hex_str("0x9e6266a76df39a05a79ea6566fb4780787a70d8bd92ac5e8d5227ee526d20554")
            .unwrap();
    let price: u64 = 1; // 1 USD
    let exponent: u32 = 18;
    let publish_time: u64 = 1665076400;
    let confidence: u64 = 0;

    // Update price feeds
    let update_data: Vec<TemporalNumericValueInput> = stork_mock
        .create_update_data(&vec![(
            price_feed_id,
            (price, exponent, publish_time, confidence),
        )])
        .await
        .unwrap();

    let update_prices_result = stork_mock
        .update_prices(update_data.clone(), 0)
        .await
        .unwrap_err();

    assert!(update_prices_result.to_string().contains("InsufficientFee"));

    stork_mock
        .update_prices(update_data.clone(), 1)
        .await
        .unwrap();

    // Get price
    let price_result = stork_mock.get_price(price_feed_id).await.unwrap();

    println!("Price: {:?}", price_result.value);

    assert_eq!(
        price_result.value.quantized_value,
        I128::new(price as u128 * 10u128.pow(exponent) + 2u128.pow(127))
    );
    assert_eq!(price_result.value.timestamp_ns, publish_time);
}
