use dotenv::dotenv;
use fuels::accounts::{provider::Provider, wallet::WalletUnlocked};
use token_sdk::deploy_tokens;

#[tokio::test]
async fn deploy() {
    dotenv().ok();

    let rpc = std::env::var("RPC").unwrap();
    let provider = Provider::connect(rpc).await.unwrap();
    let secret = std::env::var("SECRET").unwrap();
    let random_address = std::env::var("RANDOM").unwrap() == "true";

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let (_, _, token_contract) = deploy_tokens(&wallet, random_address).await;

    println!(
        "The tokens have been deployed at {}",
        token_contract.contract_id().hash
    );
}
