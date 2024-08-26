use dotenv::dotenv;
use fuels::accounts::{provider::Provider, wallet::WalletUnlocked};
use token_sdk::TokenContract;

#[tokio::test]
async fn deploy() {
    dotenv().ok();

    let rpc = std::env::var("RPC").unwrap();
    let provider = Provider::connect(rpc).await.unwrap();
    let secret = std::env::var("SECRET").unwrap();

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let token_contract = TokenContract::deploy(&wallet).await.unwrap();

    token_contract.deploy_tokens(&wallet, None).await;

    println!(
        "The tokens have been deployed at 0x{}",
        token_contract.contract_id().hash
    );
}
