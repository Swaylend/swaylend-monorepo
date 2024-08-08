use fuels::{
    test_helpers::{launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig},
    types::{Bits256, Bytes},
};

use pyth_mock_sdk::PythMockContract;
use pyth_sdk::constants::UNI_USD_PRICE_FEED_ID;

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

    let pyth_mock = PythMockContract::deploy(owner).await.unwrap();

    let price_feed_id = Bits256::from_hex_str(UNI_USD_PRICE_FEED_ID).unwrap();
    let price: u64 = 100_000_000; // 1 USD
    let exponent: u32 = 8;
    let publish_time: u64 = 1665076400;
    let confidence: u64 = 100;

    // Update price feeds
    let mut update_data: Vec<u8> = Vec::new();

    let price_feed_id_bytes = price_feed_id
        .0
        .iter()
        .map(|byte| *byte)
        .collect::<Vec<u8>>();

    update_data.extend(price_feed_id_bytes);
    update_data.extend(price.to_be_bytes());
    update_data.extend(exponent.to_be_bytes());
    update_data.extend(publish_time.to_be_bytes());
    update_data.extend(confidence.to_be_bytes());

    let update_data_bytes = Vec::from([Bytes { 0: update_data }]);

    pyth_mock
        .update_price_feeds(update_data_bytes)
        .await
        .unwrap();

    // Get price
    let price = pyth_mock.price(price_feed_id).await.unwrap();

    println!("Price: {:?}", price.value);
}
