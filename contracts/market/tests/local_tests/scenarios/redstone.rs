// **Scenario #12 - Collateral asset price increases**

// Description: Check that if collateral asset price increases, you can now borrow more base asset.
use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use chrono::Utc;
use fuels::{
    accounts::ViewOnlyAccount,
    types::{Bits256, Bytes, U256},
};
use market::PriceDataUpdate;
use market_sdk::parse_units;
use pyth_sdk::constants::ETH_USD_PRICE_FEED_ID;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;

#[tokio::test]
async fn redstone_test() {
    let TestData { market, oracle, .. } = setup(Some(10_000), TestBaseAsset::USDC).await;

    let price_feed_id = Bits256::from_hex_str(ETH_USD_PRICE_FEED_ID).unwrap();
    let price: u64 = 350_000_000_000;
    let exponent: u32 = 8;
    let publish_time: u64 = 0;
    let confidence: u64 = 50;

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
    oracle.update_price_feeds(update_data_bytes).await.unwrap();

    market.debug_increment_timestamp().await.unwrap();
    market.debug_increment_timestamp().await.unwrap();
    market.debug_increment_timestamp().await.unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // pyth price feed id ETH/USD
    let price_feed_id = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
    let redstone_feed_id = U256::from("ETH".as_bytes());
    let redstone_payload = [
        69, 84, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        62, 138, 241, 216, 238, 1, 149, 24, 251, 87, 128, 0, 0, 0, 32, 0, 0, 1, 55, 180, 4, 249,
        95, 24, 101, 206, 128, 159, 37, 66, 228, 73, 184, 177, 115, 210, 23, 121, 240, 62, 18, 210,
        56, 204, 197, 52, 64, 235, 64, 94, 111, 176, 160, 94, 27, 18, 211, 49, 2, 129, 254, 218,
        51, 58, 162, 57, 226, 224, 116, 18, 50, 238, 224, 163, 233, 107, 1, 177, 51, 81, 249, 140,
        28, 0, 1, 0, 0, 0, 0, 0, 2, 237, 87, 1, 30, 0, 0,
    ];
    let pyth_price = oracle
        .price(Bits256::from_hex_str(ETH_USD_PRICE_FEED_ID).unwrap())
        .await
        .unwrap();

    assert_eq!(pyth_price.value.publish_time, 0);

    let response = market
        .get_price(
            &[&oracle.instance],
            Bits256::from_hex_str(price_feed_id).unwrap(),
            redstone_feed_id,
            Bytes(redstone_payload.to_vec()),
        )
        .await
        .unwrap();

    assert_eq!(response.value.publish_time, 1_739_880_880_000);
    assert_eq!(response.value.price, 268_619_077_870);

    println!(
        "🔺 ETH price: {}",
        response.value.price as f64 / 10_u64.pow(response.value.exponent) as f64
    );
}
