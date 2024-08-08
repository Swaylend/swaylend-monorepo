use dotenv::dotenv;
use fuels::{
    prelude::{Provider, WalletUnlocked},
    types::{Bits256, ContractId},
};
use market_sdk::{get_market_config, MarketContract};
use pyth_sdk::constants::USDC_USD_PRICE_FEED_ID;
use std::{path::PathBuf, str::FromStr};
use token_sdk::TokenContract;

#[tokio::test]
async fn deploy() {
    //--------------- WALLET ---------------
    dotenv().ok();
    let rpc = std::env::var("RPC").unwrap();
    println!("{}", rpc);
    let provider = Provider::connect(rpc).await.unwrap();

    let secret = std::env::var("SECRET").unwrap();
    let oracle_address = std::env::var("ORACLE_ADDRESS").unwrap();
    let token_contract_address = std::env::var("TOKEN_CONTRACT_ADDRESS").unwrap();
    let use_random_address = std::env::var("RANDOM").unwrap() == "true";

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let oracle_id = ContractId::from_str(&oracle_address).unwrap();
    let token_id = ContractId::from_str(&token_contract_address).unwrap();

    //--------------- Tokens ---------------
    let tokens_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/token_sdk/tokens.json");
    let tokens_path_str = tokens_json_path.to_str().unwrap();

    let token_contract = TokenContract::new(token_id, wallet.clone()).await;
    let (assets, asset_configs) = token_contract.load_tokens(tokens_path_str, &wallet).await;
    let usdc = assets.get("USDC").unwrap();

    //--------------- MARKET ---------------
    let usdc_price_feed = Bits256::from_hex_str(USDC_USD_PRICE_FEED_ID).unwrap();
    let fuel_eth_base_asset_id =
        Bits256::from_hex_str("0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07")
            .unwrap();

    let market_config = get_market_config(
        wallet.address().into(),
        wallet.address().into(),
        usdc.bits256,
        usdc.decimals as u32,
        usdc_price_feed,
        fuel_eth_base_asset_id,
    )
    .unwrap();

    let market = MarketContract::deploy(&wallet, market_config, 0, use_random_address)
        .await
        .unwrap();

    // Set Pyth contract ID
    market.set_pyth_contract_id(oracle_id).await.unwrap();

    // Activate contract
    market.activate_contract().await.unwrap();

    let block = provider.latest_block_height().await.unwrap();

    //--------------- SETUP COLLATERALS ---------------
    for config in &asset_configs {
        market.add_collateral_asset(&config).await.unwrap();
    }

    println!("Market contract = {}", market.contract_id().hash());
    println!("start_block: {block}",);
}
