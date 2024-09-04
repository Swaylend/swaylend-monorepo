use std::path::PathBuf;

use dotenv::dotenv;
use fuels::accounts::{provider::Provider, wallet::WalletUnlocked};
use token_sdk::{TokenAsset, TokenContract};

#[tokio::test]
async fn deploy() {
    dotenv().ok();

    let rpc = std::env::var("RPC").unwrap();
    let provider = Provider::connect(rpc).await.unwrap();
    let secret = std::env::var("SECRET").unwrap();

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let token_contract = TokenContract::deploy(&wallet).await.unwrap();

    let (assets, _) = token_contract.deploy_tokens(&wallet, None).await;

    for asset in assets.keys() {
        if asset == "ETH" {
            continue;
        }

        let asset = assets.get(asset).unwrap();
        let asset = TokenAsset::new(
            wallet.clone(),
            token_contract.contract_id().try_into().unwrap(),
            &asset.symbol,
        );

        asset
            .set_decimals(asset.decimals.try_into().unwrap())
            .await
            .unwrap();
        asset.set_name(asset.symbol.clone()).await.unwrap();
        asset.set_symbol(asset.symbol.clone()).await.unwrap();
    }

    println!(
        "The tokens have been deployed at 0x{}",
        token_contract.contract_id().hash
    );
}
