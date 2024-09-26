use std::{path::PathBuf, str::FromStr};

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::ContractId,
};
use market_sdk::MarketContract;
use token_sdk::TokenContract;

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(short, long, default_value = "127.0.0.1:4000")]
    pub provider_url: String,
    #[arg(short, long, required = true, env = "SIGNING_KEY")]
    pub signing_key: String,
    #[arg(long, required = true)]
    pub token_contract_id: String,
    #[arg(long, required = true)]
    pub target_contract_id: String,

    #[arg(long)]
    pub is_upgradeable: bool,
    #[arg(long, requires_if("true", "is_upgradeable"))]
    pub proxy_contract_id: Option<String>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args = Args::parse();
    let provider = Provider::connect(&args.provider_url).await.unwrap();
    let secret = SecretKey::from_str(&args.signing_key).unwrap();
    let signing_wallet = WalletUnlocked::new_from_private_key(secret, Some(provider));
    let token_contract_id = ContractId::from_str(&args.token_contract_id).unwrap();
    let market_contract_id = ContractId::from_str(&args.target_contract_id).unwrap();
    let tokens_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/token_sdk/tokens.devnet.json");
    let tokens_path_str = tokens_json_path.to_str().unwrap();

    let token_contract = TokenContract::new(token_contract_id, signing_wallet.clone()).await;
    let (_, asset_configs) = token_contract
        .load_tokens(tokens_path_str, &signing_wallet)
        .await;

    let market = MarketContract::new(market_contract_id, signing_wallet.clone()).await;
    for config in &asset_configs {
        market.add_collateral_asset(&config).await.unwrap();
    }
    println!("Added collaterals");
    Ok(())
}
