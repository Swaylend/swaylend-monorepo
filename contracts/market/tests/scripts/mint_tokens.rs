use dotenv::dotenv;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    types::ContractId,
};
use std::{path::PathBuf, str::FromStr};
use token_sdk::{TokenAsset, TokenContract};

#[tokio::test]
async fn mint() {
    dotenv().ok();

    let rpc = std::env::var("RPC").unwrap();
    let provider = Provider::connect(rpc).await.unwrap();
    let secret = std::env::var("SECRET").unwrap();
    let token_contract_address = std::env::var("TOKEN_CONTRACT_ADDRESS").unwrap();

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let token_contract_id = ContractId::from_str(&token_contract_address).unwrap();
    let token_contract = TokenContract::new(token_contract_id, wallet.clone()).await;

    let tokens_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/token_sdk/tokens.json");
    let tokens_path_str = tokens_json_path.to_str().unwrap();

    let (assets, _) = token_contract.load_tokens(tokens_path_str, &wallet).await;

    for asset in assets.keys() {
        if asset == "ETH" {
            continue;
        }

        let asset = assets.get(asset).unwrap();
        let asset = TokenAsset::new(wallet.clone(), token_contract_id, &asset.symbol);
        println!("{}: {}", asset.symbol, asset.asset_id);
        asset.mint(wallet.address().into(), 100000).await.unwrap();
    }
}
