use fuels::{
    accounts::ViewOnlyAccount,
    test_helpers::{launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig},
    types::U256,
};
use redstone_prices_mock_sdk::RedstonePricesMockContract;

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

    let redstone_mock = RedstonePricesMockContract::deploy(owner).await.unwrap();
    redstone_mock
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap();

    let price_feed_id = U256::from_dec_str("1431520323").unwrap();
    let price = 100_000_000; // 1 USD
    let publish_time = 1665076400;
    let confidence = 0;
    let prices = vec![(price_feed_id, (price, 8, publish_time, confidence))];

    let update_data = redstone_mock.create_update_data(&prices).await.unwrap();

    redstone_mock
        .update_prices(update_data.0, update_data.1)
        .await
        .unwrap();

    let price_response = redstone_mock.get_price(price_feed_id).await.unwrap();
    println!("Price: {:?}", price_response.value);

    assert_eq!(price_response.value.price, U256::from(price));
    assert_eq!(price_response.value.exponent, 8);
    assert_eq!(price_response.value.publish_time, publish_time);
    assert_eq!(price_response.value.confidence, 0);
}
