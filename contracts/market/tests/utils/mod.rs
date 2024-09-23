use chrono::Utc;
use fuels::accounts::wallet::WalletUnlocked;
use fuels::test_helpers::{
    launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig,
};
use fuels::types::{Address, Bits256, ContractId};
use market_sdk::{get_market_config, MarketContract};
use pyth_mock_sdk::PythMockContract;
use std::collections::HashMap;
use std::result::Result::Ok;
use token_sdk::{Asset, TokenAsset, TokenContract};

pub fn print_case_title(num: u8, name: &str, call: &str, amount: &str) {
    println!(
        r#"
==================== Step #{num} ====================
👛 Wallet: {name}
🤙 Call: {call}
💰 Amount: {amount}
"#
    );
}

pub async fn init_wallets() -> Vec<WalletUnlocked> {
    let wallets_config = WalletsConfig::new(Some(5), Some(10), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    return match launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
        .await
    {
        Ok(wallets) => wallets,
        Err(e) => panic!("wallets init error: {}", e),
    };
}

pub struct TestData {
    pub admin: WalletUnlocked,
    pub admin_address: Address,
    pub alice: WalletUnlocked,
    pub alice_address: Address,
    pub bob: WalletUnlocked,
    pub bob_address: Address,
    pub chad: WalletUnlocked,
    pub chad_address: Address,
    pub oracle: PythMockContract,
    pub market: MarketContract,
    pub usdc: Asset,
    pub usdc_contract: TokenAsset,
    pub uni: Asset,
    pub uni_contract: TokenAsset,
    pub eth: Asset,
    pub wallets: Vec<WalletUnlocked>,
    pub price_feed_ids: Vec<Bits256>,
    pub publish_time: u64,
    pub assets: HashMap<String, Asset>,
    pub prices: Vec<(Bits256, (u64, u32, u64, u64))>,
}

pub async fn setup() -> TestData {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = &wallets[0];
    let alice = &wallets[1];
    let bob = &wallets[2];
    let chad = &wallets[3];

    //--------------- ORACLE ---------------
    let oracle = PythMockContract::deploy(&admin).await.unwrap();
    let oracle_contract_id = ContractId::from(oracle.instance.contract_id());

    //--------------- TOKENS ---------------
    let token_contract = TokenContract::deploy(&admin).await.unwrap();
    let (assets, asset_configs) = token_contract.deploy_tokens(&admin, Some(true)).await;

    let usdc = assets.get("USDC").unwrap();
    let usdc_contract = TokenAsset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &usdc.symbol,
    );
    let uni = assets.get("UNI").unwrap();
    let uni_contract = TokenAsset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &uni.symbol,
    );
    let eth = assets.get("ETH").unwrap().clone();

    //--------------- MARKET ---------------
    let market_config = get_market_config(
        admin.address().into(),
        admin.address().into(),
        usdc.asset_id,
        usdc.decimals as u32,
        usdc.price_feed_id,
    )
    .unwrap();

    // debug step
    let debug_step: u64 = 10_000;
    let market = MarketContract::deploy(&admin, debug_step, false)
        .await
        .unwrap();

    // Activate contract
    market.activate_contract(market_config).await.unwrap();

    // Set Pyth contract ID
    market
        .set_pyth_contract_id(oracle_contract_id)
        .await
        .unwrap();

    //--------------- SETUP COLLATERALS ---------------
    for config in &asset_configs {
        market.add_collateral_asset(&config).await.unwrap();
    }

    // ==================== Set oracle prices ====================
    let mut prices = Vec::new();
    let mut price_feed_ids = Vec::new();
    let publish_time: u64 = tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0;
    let confidence = 0;

    for asset in &assets {
        let price = asset.1.default_price * 10u64.pow(asset.1.price_feed_decimals);

        prices.push((
            asset.1.price_feed_id,
            (price, asset.1.price_feed_decimals, publish_time, confidence),
        ))
    }

    oracle.update_prices(&prices).await.unwrap();

    for asset in &assets {
        let price = oracle.price(asset.1.price_feed_id).await.unwrap().value;

        price_feed_ids.push(asset.1.price_feed_id);

        println!(
            "Price for {} = {}",
            asset.1.symbol,
            price.price as f64 / 10u64.pow(asset.1.price_feed_decimals as u32) as f64
        );
    }
    TestData {
        wallets: wallets.clone(),
        admin: admin.clone(),
        admin_address: Address::from(admin.address()),
        alice: alice.clone(),
        alice_address: Address::from(alice.address()),
        bob: bob.clone(),
        bob_address: Address::from(bob.address()),
        chad: chad.clone(),
        chad_address: Address::from(chad.address()),
        oracle,
        market,
        usdc: usdc.clone(),
        usdc_contract,
        uni: uni.clone(),
        uni_contract,
        eth: eth.clone(),
        price_feed_ids,
        publish_time,
        assets,
        prices,
    }
}
