use clap::Parser;
use dotenv::dotenv;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    macros::abigen,
    types::{bech32::Bech32ContractId, ContractId},
};
use serde::Deserialize;
use std::{path::PathBuf, str::FromStr};

abigen!(Contract(
    name = "MarketContract",
    abi = "contracts/market/out/release/market-abi.json"
));

#[derive(clap::ValueEnum, Clone, Debug, Eq, PartialEq)]
pub enum Network {
    Mainnet,
    Testnet,
    Devnet,
}

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(long, env = "PROVIDER_URL", default_value = "http://127.0.0.1:4000")]
    pub provider_url: String,
    #[clap(value_enum)]
    #[arg(long, env = "NETWORK", default_value = "devnet")]
    pub network: Network,
    #[arg(long, required = true, env = "SIGNING_KEY")]
    pub signing_key: String,
    #[arg(long, required = true, env = "PROXY_CONTRACT_ID")]
    pub proxy_contract_id: String,
    #[arg(long, required = true, env = "TARGET_CONTRACT_ID")]
    pub target_contract_id: String,
}

pub fn read_env() {
    dotenv().ok();
}

#[derive(Deserialize, Debug)]
pub struct BaseAssetConfig {
    pub asset_id: String,
    pub price_feed_id: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}

#[derive(Deserialize, Debug)]
pub struct CollateralAssetConfig {
    pub asset_id: String,
    pub price_feed_id: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub borrow_collateral_factor: u128,
    pub liquidate_collateral_factor: u128,
    pub liquidation_penalty: u128,
    pub supply_cap: u64,
}

#[derive(Deserialize, Debug)]
pub struct MarketConfig {
    pub supply_kink: u128,
    pub borrow_kink: u128,
    pub supply_per_second_interest_rate_slope_low: u128,
    pub supply_per_second_interest_rate_slope_high: u128,
    pub supply_per_second_interest_rate_base: u128,
    pub borrow_per_second_interest_rate_slope_low: u128,
    pub borrow_per_second_interest_rate_slope_high: u128,
    pub borrow_per_second_interest_rate_base: u128,
    pub store_front_price_factor: u128,
    pub base_tracking_index_scale: u128,
    pub base_tracking_supply_speed: u128,
    pub base_tracking_borrow_speed: u128,
    pub base_min_for_rewards: u64,
    pub base_borrow_min: u64,
    pub target_reserves: u64,
    pub pyth_contract_id: String,
    pub base_asset: BaseAssetConfig,
    pub collateral_assets: Vec<CollateralAssetConfig>,
}

pub fn read_market_config(path: &str) -> anyhow::Result<MarketConfig> {
    let config_path = PathBuf::from(path);
    let config_str = std::fs::read_to_string(config_path)?;
    serde_json::from_str(&config_str)
        .map_err(|e| anyhow::anyhow!("Failed to parse market config: {}", e))
}

pub async fn verify_connected_network(
    provider: &Provider,
    network: Network,
) -> anyhow::Result<bool> {
    let chain_name = provider.chain_info().await?.name;
    println!("Connected to chain: {}", chain_name);
    match chain_name.as_str() {
        "Mainnet" => Ok(network == Network::Mainnet),
        "Ignition" => Ok(network == Network::Testnet),
        "Local network" => Ok(network == Network::Devnet),
        _ => Ok(false),
    }
}

pub async fn get_market_instance(
    wallet: WalletUnlocked,
    proxy_contract_id: String,
    target_contract_id: String,
) -> anyhow::Result<(MarketContract<WalletUnlocked>, Bech32ContractId)> {
    let proxy_contract_id: Bech32ContractId =
        ContractId::from_str(&proxy_contract_id).unwrap().into();
    let market_instance = MarketContract::new(proxy_contract_id, wallet.clone());
    let target_contract_id = ContractId::from_str(&target_contract_id).unwrap();

    Ok((market_instance, target_contract_id.into()))
}

#[allow(dead_code)]
fn main() {
    println!("good utils for deployment. just ignore this fn");
}
