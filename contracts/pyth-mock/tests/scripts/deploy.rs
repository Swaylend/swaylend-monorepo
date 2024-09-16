use dotenv::dotenv;
use fuels::prelude::{Provider, WalletUnlocked};
use pyth_mock_sdk::PythMockContract;

#[tokio::test]
async fn deploy() {
    //--------------- WALLET ---------------
    dotenv().ok();
    let rpc = std::env::var("RPC").unwrap();
    println!("{}", rpc);
    let provider = Provider::connect(rpc).await.unwrap();

    let secret = std::env::var("SECRET").unwrap();

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let oracle = PythMockContract::deploy(&wallet).await.unwrap();

    let block = provider.latest_block_height().await.unwrap();

    println!("Mock oracle contract = 0x{}", oracle.contract_id().hash());
    println!("start_block: {block}",);
}
