use crate::utils::shared::Network;

use clap::Parser;
use fuels::{accounts::wallet::Wallet, types::ContractId};
use redstone_prices::RedstonePrices;
use serde::Deserialize;
use std::{path::PathBuf, str::FromStr};

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(long, env = "PROVIDER_URL", default_value = "http://127.0.0.1:4000")]
    pub provider_url: String,
    #[clap(value_enum)]
    #[arg(long, env = "NETWORK", default_value = "devnet")]
    pub network: Network,
    #[arg(long, required = true, env = "SIGNING_KEY")]
    pub signing_key: String,
    #[arg(long, required = true, env = "REDSTONE_PRICES_PROXY_CONTRACT_ID")]
    pub redstone_prices_proxy_contract_id: String,
    #[arg(long, required = true, env = "REDSTONE_PRICES_TARGET_CONTRACT_ID")]
    pub redstone_prices_target_contract_id: String,
}

pub async fn get_redstone_prices_instance(
    wallet: &Wallet,
    proxy_contract_id: String,
    target_contract_id: String,
) -> anyhow::Result<(RedstonePrices<Wallet>, ContractId)> {
    let proxy_contract_id: ContractId = ContractId::from_str(&proxy_contract_id).unwrap();
    let redstone_prices_instance = RedstonePrices::new(proxy_contract_id, wallet.clone());
    let target_contract_id = ContractId::from_str(&target_contract_id).unwrap();

    Ok((redstone_prices_instance, target_contract_id.into()))
}

#[derive(Debug, Deserialize)]
pub struct RedstonePricesConfig {
    pub signer_count_threshold: u64,
    pub allowed_signers: Vec<String>,
}

pub fn read_redstone_prices_config(path: &str) -> anyhow::Result<RedstonePricesConfig> {
    let config_path = PathBuf::from(path);
    let config_str = std::fs::read_to_string(config_path)?;
    serde_json::from_str(&config_str)
        .map_err(|e| anyhow::anyhow!("Failed to parse market config: {}", e))
}
