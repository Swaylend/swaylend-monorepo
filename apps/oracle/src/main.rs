use dotenv::dotenv;
use fuels::accounts::ViewOnlyAccount;
use fuels::prelude::{ContractId, Provider, WalletUnlocked};
use fuels::types::Bytes;
use pyth_sdk::constants::{
    BTC_USD_PRICE_FEED_ID, ETH_USD_PRICE_FEED_ID, UNI_USD_PRICE_FEED_ID, USDC_USD_PRICE_FEED_ID,
};
use pyth_sdk::pyth_utils::{Pyth, PythOracleContract};
use reqwest::ClientBuilder;
use serde::Deserialize;
use std::{str::FromStr, thread::sleep, time::Duration};

#[derive(Deserialize)]
struct BinaryData {
    encoding: String,
    data: Vec<String>,
}

#[derive(Deserialize)]
struct PriceUpdate {
    binary: BinaryData,
    parsed: serde_json::Value,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    // Env vars
    let rpc = std::env::var("RPC").unwrap();
    let provider = Provider::connect(rpc).await.unwrap();
    let secret = std::env::var("SECRET").unwrap();
    let oracle_address = std::env::var("ORACLE_ADDRESS").unwrap();

    // Wallet
    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    // Pyth contract
    let id = ContractId::from_str(&oracle_address).unwrap();
    let oracle =
        Pyth { instance: PythOracleContract::new(id, wallet.clone()), wallet: wallet.clone() };

    // Price feed ids to update
    let ids = vec![
        BTC_USD_PRICE_FEED_ID,
        ETH_USD_PRICE_FEED_ID,
        UNI_USD_PRICE_FEED_ID,
        USDC_USD_PRICE_FEED_ID,
    ];

    let mut params = Vec::new();
    for price_id in ids {
        params.push(("ids[]", price_id.to_string()));
    }

    let http_client = ClientBuilder::new().timeout(Duration::from_millis(5000)).build().unwrap();
    let url = "https://hermes.pyth.network/v2/updates/price/latest";

    loop {
        let response = http_client.get(url).query(&params).send().await.unwrap();
        let price_update_json = response.json::<PriceUpdate>().await.unwrap();
        let update_data =
            vec![Bytes(hex::decode(price_update_json.binary.data[0].clone()).unwrap())];
        let fee = oracle.update_fee(&update_data).await.unwrap().value;
        let update_result = oracle.update_price_feeds(fee, &update_data).await;

        let mut message = String::new();
        if update_result.is_ok() {
            message += format!("✅ Prices updated\n").as_str();
            message += format!("⛽️ Gas used: {}\n", update_result.unwrap().gas_used).as_str();
            message += format!(
                "⚖️ Balance: {} ETH\n",
                wallet.get_asset_balance(&provider.base_asset_id()).await.unwrap() as f64
                    / 10f64.powf(9f64)
            )
            .as_str();
            message += format!("-----------------------------------\n\n").as_str();
        } else {
            message += format!("❌ Prices not updated\n").as_str();
            message += format!("Error: {}\n", update_result.unwrap_err()).as_str();
        }

        println!("{message}");

        sleep(Duration::from_secs(5 * 60));
    }
}
