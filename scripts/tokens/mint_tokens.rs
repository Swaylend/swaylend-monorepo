use anyhow::Ok;
use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::ContractId,
};
use std::path::PathBuf;
use std::str::FromStr;
use token_sdk::{TokenAsset, TokenContract};

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(short, long, default_value = "127.0.0.1:4000")]
    pub provider_url: String,
    #[arg(short, long, required = true, env = "SIGNING_KEY")]
    pub signing_key: String,
    #[arg(long, required = true)]
    pub token_contract_id: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    let provider = Provider::connect(&args.provider_url).await.unwrap();
    let secret = SecretKey::from_str(&args.signing_key).unwrap();
    let signing_wallet = WalletUnlocked::new_from_private_key(secret, Some(provider));

    let token_contract = TokenContract::new(
        ContractId::from_str(&args.token_contract_id).unwrap(),
        signing_wallet.clone(),
    )
    .await;

    let tokens_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/token_sdk/tokens.testnet.json");
    let tokens_path_str = tokens_json_path.to_str().unwrap();

    let (assets, _) = token_contract
        .load_tokens(tokens_path_str, &signing_wallet)
        .await;

    for asset in assets.keys() {
        if asset == "ETH" {
            continue;
        }

        let asset = assets.get(asset).unwrap();
        let asset = TokenAsset::new(
            signing_wallet.clone(),
            token_contract.contract_id().into(),
            &asset.symbol,
        );
        println!("{}: 0x{}", asset.symbol, asset.asset_id);
        asset
            .mint(signing_wallet.address().into(), 100000)
            .await
            .unwrap();
    }

    Ok(())
}
