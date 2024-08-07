use super::market_utils::CollateralConfiguration;
use fuels::accounts::wallet::WalletUnlocked;
use fuels::programs::contract::{Contract, LoadConfiguration};
use fuels::test_helpers::generate_random_salt;
use fuels::types::transaction::TxPolicies;
use fuels::types::{AssetId, Bits256, ContractId};
use serde::Deserialize;
use src20_sdk::token_utils::{TokenContract, TokenContractConfigurables};
use std::collections::HashMap;
use std::path::PathBuf;
use std::str::FromStr;

pub struct Asset {
    pub asset_id: AssetId,
    pub decimals: u64,
    pub symbol: String,
    pub bits256: Bits256,
    pub default_price: u64,
    pub price_feed_id: Bits256,
    pub price_feed_decimals: u32,
}

#[derive(Deserialize)]
pub struct TokenConfig {
    pub asset_id: String,
    #[serde(rename = "name")]
    pub _name: String,
    pub symbol: String,
    pub default_price: u64,
    pub decimals: u32,
    pub borrow_collateral_factor: Option<u128>,
    pub liquidate_collateral_factor: Option<u128>,
    pub liquidation_penalty: Option<u128>,
    pub supply_cap: Option<u128>,
    pub price_feed_id: String,
    pub price_feed_decimals: u32,
}

pub async fn deploy_token_contract(
    wallet: &WalletUnlocked,
    random_address: bool,
) -> TokenContract<WalletUnlocked> {
    let configurables = TokenContractConfigurables::default();
    let config = LoadConfiguration::default().with_configurables(configurables);
    let bin_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("contracts/token/out/release/token.bin");

    let id = if random_address {
        let salt = generate_random_salt();
        Contract::load_from(bin_path, config)
            .unwrap()
            .with_salt(salt)
            .deploy(wallet, TxPolicies::default().with_tip(1))
            .await
            .unwrap()
    } else {
        Contract::load_from(bin_path, config)
            .unwrap()
            .deploy(wallet, TxPolicies::default().with_tip(1))
            .await
            .unwrap()
    };

    let instance = TokenContract::new(id.clone(), wallet.clone());
    instance
}

pub async fn deploy_tokens(
    wallet: &WalletUnlocked,
    random_address: bool,
) -> (
    HashMap<String, Asset>,
    Vec<CollateralConfiguration>,
    TokenContract<WalletUnlocked>,
) {
    let token_contract = deploy_token_contract(&wallet, random_address).await;

    let tokens_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/src20_sdk/tokens.json");
    let tokens_json = std::fs::read_to_string(tokens_json_path).unwrap();
    let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();

    let mut assets: HashMap<String, Asset> = HashMap::new();
    let mut asset_configs: Vec<CollateralConfiguration> = vec![];

    for config in token_configs {
        let symbol = config.symbol;

        let token = src20_sdk::token_utils::Asset::new(
            wallet.clone(),
            token_contract.contract_id().into(),
            &symbol,
        );

        let asset_id = if symbol == "ETH" {
            AssetId::from_str(&config.asset_id).unwrap()
        } else {
            token.asset_id
        };

        // everything except USDC is collateral
        if symbol != "USDC" {
            asset_configs.push(CollateralConfiguration {
                asset_id: asset_id.into(),
                price_feed_id: Bits256::from_hex_str(config.price_feed_id.as_str()).unwrap(),
                decimals: config.decimals,
                borrow_collateral_factor: config.borrow_collateral_factor.unwrap().into(), // decimals: 18
                liquidate_collateral_factor: config.liquidate_collateral_factor.unwrap().into(), // decimals: 18
                liquidation_penalty: config.liquidation_penalty.unwrap().into(), // decimals: 18
                supply_cap: config.supply_cap.unwrap().into(), // decimals: asset decimals
                paused: false,
            });
        }

        assets.insert(
            symbol.clone(),
            Asset {
                asset_id: asset_id.into(),
                price_feed_id: Bits256::from_hex_str(config.price_feed_id.as_str()).unwrap(),
                price_feed_decimals: config.price_feed_decimals,
                decimals: token.decimals,
                symbol: token.symbol,
                bits256: asset_id.into(),
                default_price: config.default_price,
            },
        );
    }

    (assets, asset_configs, token_contract)
}

pub async fn load_tokens(
    tokens_json_path: &str,
    wallet: &WalletUnlocked,
    contract_id: ContractId,
) -> (HashMap<String, Asset>, Vec<CollateralConfiguration>) {
    let tokens_json = std::fs::read_to_string(tokens_json_path).unwrap();
    let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();

    let mut assets: HashMap<String, Asset> = HashMap::new();
    let mut asset_configs: Vec<CollateralConfiguration> = Vec::new();

    for config in token_configs {
        let symbol = config.symbol;

        let token = src20_sdk::token_utils::Asset::new(wallet.clone(), contract_id, &symbol);

        let asset_id = if symbol == "ETH" {
            AssetId::from_str(&config.asset_id).unwrap()
        } else {
            token.asset_id
        };

        assets.insert(
            symbol.clone(),
            Asset {
                asset_id: asset_id.into(),
                price_feed_id: Bits256::from_hex_str(config.price_feed_id.as_str()).unwrap(),
                price_feed_decimals: config.price_feed_decimals,
                decimals: config.decimals.into(),
                symbol: symbol.clone(),
                bits256: asset_id.into(),
                default_price: config.default_price,
            },
        );

        // everything except USDC is collateral
        if symbol != "USDC" {
            asset_configs.push(CollateralConfiguration {
                asset_id: asset_id.into(),
                decimals: config.decimals,
                price_feed_id: Bits256::from_hex_str(config.price_feed_id.as_str()).unwrap(),
                borrow_collateral_factor: config.borrow_collateral_factor.unwrap().into(), // decimals: 18
                liquidate_collateral_factor: config.liquidate_collateral_factor.unwrap().into(), // decimals: 18
                liquidation_penalty: config.liquidation_penalty.unwrap().into(), // decimals: 18
                supply_cap: config.supply_cap.unwrap().into(), // decimals: asset decimals
                paused: false,
            })
        }
    }
    (assets, asset_configs)
}
