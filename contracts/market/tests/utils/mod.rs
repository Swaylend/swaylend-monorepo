use chrono::Utc;
use fuels::accounts::wallet::WalletUnlocked;
use fuels::test_helpers::{
    launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig,
};
use fuels::types::{AssetId, Bits256, ContractId, Identity, U256};
use market::{
    OracleAssetConfiguration, OracleGlobalConfiguration, OracleInput, OracleType, PythOracleInput,
    RedstoneOracleInput,
};
use market_sdk::{get_market_config, Market};
use pyth_mock_sdk::PythMockContract;
use redstone_prices_mock_sdk::RedstonePricesMockContract;
use std::collections::HashMap;
use std::result::Result::Ok;
use std::str::FromStr;
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

pub async fn init_wallets(use_gas_price: bool) -> Vec<WalletUnlocked> {
    let wallets_config = WalletsConfig::new(Some(5), Some(1000), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        starting_gas_price: if use_gas_price { 0 } else { 1 },
        ..NodeConfig::default()
    };

    return match launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
        .await
    {
        Ok(wallets) => wallets,
        Err(e) => panic!("wallets init error: {}", e),
    };
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TestBaseAsset {
    USDC,
    ETH,
}

pub struct TestData {
    pub admin: WalletUnlocked,
    pub admin_account: Identity,
    pub alice: WalletUnlocked,
    pub alice_account: Identity,
    pub bob: WalletUnlocked,
    pub bob_account: Identity,
    pub chad: WalletUnlocked,
    pub chad_account: Identity,
    pub market: Market,
    pub usdc: Asset,
    pub usdc_contract: TokenAsset,
    pub usdt: Asset,
    pub usdt_contract: TokenAsset,
    pub uni: Asset,
    pub uni_contract: TokenAsset,
    pub eth: Asset,
    pub wallets: Vec<WalletUnlocked>,
    pub assets: HashMap<String, Asset>,
    pub oracle_inputs: Vec<OracleInput>,
    pub oracle_total_update_fee: u64,
    pub pyth_mock_oracle: PythMockContract,
    pub pyth_prices: Vec<(Bits256, (u64, u32, u64, u64))>,
    pub pyth_asset_price_feeds: HashMap<AssetId, (Bits256, u32)>, // asset_id -> (price_feed_id, price_feed_decimals)
    pub redstone_mock_oracle: RedstonePricesMockContract,
    pub redstone_prices: Vec<(U256, (u64, u32, u64, u64))>,
    pub redstone_asset_price_feeds: HashMap<AssetId, (U256, u32)>, // asset_id -> (price_feed_id, price_feed_decimals)
}

pub fn string_to_price_feed_id(
    price_feed_id: String,
    oracle_type: String,
) -> market::OraclePriceFeedId {
    match oracle_type.as_str() {
        "Pyth" => market::OraclePriceFeedId::Pyth(Bits256::from_hex_str(&price_feed_id).unwrap()),
        "Redstone" => market::OraclePriceFeedId::Redstone(U256::from(price_feed_id.as_bytes())),
        "Twrap" => market::OraclePriceFeedId::Twrap,
        "Stork" => market::OraclePriceFeedId::Stork,
        _ => panic!("Invalid oracle type: {}", oracle_type),
    }
}

pub async fn setup(
    debug_step: Option<u64>,
    base_asset: TestBaseAsset,
    config_file: Option<&str>,
) -> TestData {
    //--------------- WALLETS ---------------
    let no_fees = base_asset == TestBaseAsset::ETH;
    let wallets = init_wallets(no_fees).await;
    let admin = &wallets[0];
    let alice = &wallets[1];
    let bob = &wallets[2];
    let chad = &wallets[3];

    //--------------- ORACLES ---------------
    let pyth_mock_oracle = PythMockContract::deploy(&admin).await.unwrap();
    let redstone_mock_oracle = RedstonePricesMockContract::deploy(&admin).await.unwrap();
    redstone_mock_oracle
        .activate(1, vec![], admin.address().into())
        .await
        .unwrap();

    //--------------- TOKENS ---------------
    let token_contract = TokenContract::deploy(&admin).await.unwrap();
    let (assets, asset_configs, oracle_configs) = token_contract
        .deploy_tokens(&admin, Some(true), config_file)
        .await;

    let usdc = assets.get("USDC").unwrap();
    let usdc_contract = TokenAsset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &usdc.symbol,
    );
    let usdt = assets.get("USDT").unwrap();
    let usdt_contract = TokenAsset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &usdt.symbol,
    );

    let uni = assets.get("UNI").unwrap();
    let uni_contract = TokenAsset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &uni.symbol,
    );
    let eth = assets.get("ETH").unwrap().clone();

    //--------------- MARKET ---------------
    let market_config = match base_asset {
        TestBaseAsset::USDC => get_market_config(usdc.asset_id, usdc.decimals as u32).unwrap(),
        TestBaseAsset::ETH => get_market_config(eth.asset_id, eth.decimals as u32).unwrap(),
    };

    // debug step
    let debug_step: u64 = debug_step.unwrap_or(10_000);
    let market = Market::deploy(&admin, debug_step, false).await.unwrap();

    // Activate contract
    market
        .activate_contract(market_config, admin.address().into())
        .await
        .unwrap();

    //--------------- SETUP COLLATERALS ---------------
    for config in &asset_configs {
        market.add_collateral_asset(&config).await.unwrap();
    }

    //--------------- SETUP GLOBAL ORACLES ---------------
    // We only add Pyth for now
    let global_oracle_configurations = vec![
        OracleGlobalConfiguration {
            contract_id: ContractId::from(pyth_mock_oracle.instance.contract_id()),
            is_disabled: false,
            oracle_type: OracleType::Pyth,
        },
        OracleGlobalConfiguration {
            contract_id: ContractId::from(redstone_mock_oracle.instance.contract_id()),
            is_disabled: false,
            oracle_type: OracleType::Redstone,
        },
    ];

    for config in &global_oracle_configurations {
        market.add_new_global_oracle(config).await.unwrap();
    }

    //--------------- SETUP ASSET ORACLES ---------------
    for (asset_id, configs) in &oracle_configs {
        for config in configs {
            market
                .add_new_asset_oracle(
                    *asset_id,
                    &OracleAssetConfiguration {
                        oracle_id: config.oracle_id,
                        price_feed_id: string_to_price_feed_id(
                            config.price_feed_id.clone(),
                            config.oracle_type.clone(),
                        ),
                        is_disabled: false,
                    },
                )
                .await
                .unwrap();

            println!(
                "Added oracle type {} for asset {} with id {} and price feed id {}",
                config.oracle_type, asset_id, config.oracle_id, config.price_feed_id
            );
        }
    }

    let mut oracle_inputs: Vec<OracleInput> = Vec::new();
    let mut oracle_total_update_fee = 0;

    // ==================== Set oracle prices ====================

    // Prepare PythOracleInput
    let mut pyth_asset_price_feeds = HashMap::new();
    let mut prices = Vec::new();
    let mut price_feed_ids = Vec::new();
    let publish_time: u64 = tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0;
    let confidence = 0;

    for asset in &assets {
        let oracle_configs = oracle_configs.get(&asset.1.asset_id).unwrap();
        let config = oracle_configs.iter().find(|c| c.oracle_id == 0);

        if config.is_none() {
            continue;
        }

        let config = config.unwrap();
        let price = asset.1.default_price * 10u64.pow(config.price_feed_decimals as u32);

        prices.push((
            Bits256::from_hex_str(&config.price_feed_id).unwrap(),
            (price, config.price_feed_decimals, publish_time, confidence),
        ));

        price_feed_ids.push(string_to_price_feed_id(
            config.price_feed_id.clone(),
            config.oracle_type.clone(),
        ));

        pyth_asset_price_feeds.insert(
            asset.1.asset_id,
            (
                Bits256::from_hex_str(&config.price_feed_id).unwrap(),
                config.price_feed_decimals,
            ),
        );

        println!(
            "[Pyth] Price for {} = {}",
            asset.1.symbol,
            price as f64 / 10u64.pow(config.price_feed_decimals as u32) as f64
        );
    }

    if price_feed_ids.len() > 0 {
        let price_feed_count = price_feed_ids.len();
        pyth_mock_oracle.update_prices(&prices).await.unwrap();

        oracle_inputs.push(OracleInput::Pyth(PythOracleInput {
            contract_id: ContractId::from(pyth_mock_oracle.instance.contract_id()),
            update_fee: price_feed_count as u64,
            publish_times: vec![publish_time; price_feed_count],
            price_feed_ids: price_feed_ids
                .iter()
                .map(|id| {
                    if let market::OraclePriceFeedId::Pyth(id) = id {
                        id.clone()
                    } else {
                        panic!("Invalid price feed id: {:?}", id)
                    }
                })
                .collect::<Vec<Bits256>>(),
            update_data: pyth_mock_oracle.create_update_data(&prices).await.unwrap(),
        }));

        oracle_total_update_fee += price_feed_count as u64;
    }

    // Prepare redstone input
    let mut redstone_asset_price_feeds = HashMap::new();
    let mut redstone_prices = Vec::new();
    let redstone_publish_time: u64 =
        tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0;
    let redstone_confidence = 0;

    for asset in &assets {
        let oracle_configs = oracle_configs.get(&asset.1.asset_id).unwrap();
        let config = oracle_configs.iter().find(|c| c.oracle_id == 1);

        if config.is_none() {
            continue;
        }

        let config = config.unwrap();
        let price = asset.1.default_price * 10u64.pow(config.price_feed_decimals as u32);

        redstone_prices.push((
            U256::from(config.price_feed_id.as_bytes()),
            (
                price,
                config.price_feed_decimals,
                redstone_publish_time,
                redstone_confidence,
            ),
        ));

        redstone_asset_price_feeds.insert(
            asset.1.asset_id,
            (
                U256::from(config.price_feed_id.as_bytes()),
                config.price_feed_decimals,
            ),
        );

        println!(
            "[Redstone] Price for {} = {}",
            asset.1.symbol,
            price as f64 / 10u64.pow(config.price_feed_decimals as u32) as f64
        );
    }

    if redstone_prices.len() > 0 {
        let (price_feed_ids, payload) = redstone_mock_oracle
            .create_update_data(&redstone_prices)
            .await
            .unwrap();

        redstone_mock_oracle
            .update_prices(price_feed_ids.clone(), payload.clone())
            .await
            .unwrap();

        oracle_inputs.push(OracleInput::Redstone(RedstoneOracleInput {
            contract_id: ContractId::from(redstone_mock_oracle.instance.contract_id()),
            price_feed_ids: price_feed_ids,
            payload,
        }));
    }

    TestData {
        wallets: wallets.clone(),
        admin: admin.clone(),
        admin_account: admin.address().into(),
        alice: alice.clone(),
        alice_account: alice.address().into(),
        bob: bob.clone(),
        bob_account: bob.address().into(),
        chad: chad.clone(),
        chad_account: chad.address().into(),
        market,
        usdc: usdc.clone(),
        usdc_contract,
        usdt: usdt.clone(),
        usdt_contract,
        uni: uni.clone(),
        uni_contract,
        eth: eth.clone(),
        assets,
        oracle_inputs,
        oracle_total_update_fee,
        pyth_mock_oracle,
        pyth_prices: prices,
        pyth_asset_price_feeds,
        redstone_mock_oracle,
        redstone_prices,
        redstone_asset_price_feeds,
    }
}
