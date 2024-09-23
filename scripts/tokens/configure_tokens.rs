use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::ContractId,
};
use std::str::FromStr;
use std::{thread::sleep, time::Duration};
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

    let (assets, _) = token_contract.deploy_tokens(&signing_wallet, None).await;

    for asset in assets.keys() {
        if asset == "ETH" {
            continue;
        }

        let asset = assets.get(asset).unwrap();
        let asset = TokenAsset::new(
            signing_wallet.clone(),
            token_contract.contract_id().try_into().unwrap(),
            &asset.symbol,
        );

        asset
            .set_decimals(asset.decimals.try_into().unwrap())
            .await
            .unwrap();
        asset.set_name(asset.symbol.clone()).await.unwrap();
        asset.set_symbol(asset.symbol.clone()).await.unwrap();
        sleep(Duration::from_secs(1));
        println!("Asset {} has been deployed", asset.symbol);
    }

    println!(
        "The tokens have been deployed at 0x{}",
        token_contract.contract_id().hash
    );

    Ok(())
}
