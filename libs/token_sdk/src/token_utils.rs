use market::*;
use token::*;

use fuels::accounts::wallet::WalletUnlocked;
use fuels::programs::contract::{Contract, LoadConfiguration};
use fuels::types::bech32::Bech32ContractId;
use fuels::types::transaction::TxPolicies;
use fuels::types::{AssetId, Bits256, Bytes32, ContractId};
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::str::FromStr;

use crate::TokenAsset;

pub struct TokenContract {
    pub instance: Token<WalletUnlocked>,
}

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

impl TokenContract {
    pub async fn deploy(wallet: &WalletUnlocked) -> anyhow::Result<Self> {
        let configurables = TokenConfigurables::default();
        let root = PathBuf::from(env!("CARGO_WORKSPACE_DIR"));
        let bin_path = root.join("contracts/token/out/release/token.bin");
        let config = LoadConfiguration::default().with_configurables(configurables);

        let id = Contract::load_from(bin_path, config)?
            .deploy(wallet, TxPolicies::default())
            .await?;
        let instance = Token::new(id.clone(), wallet.clone());

        Ok(Self { instance })
    }

    pub async fn new(contract_id: ContractId, wallet: WalletUnlocked) -> Self {
        Self {
            instance: Token::new(contract_id, wallet),
        }
    }

    pub async fn with_account(&self, account: &WalletUnlocked) -> anyhow::Result<Self> {
        Ok(Self {
            instance: Token::new(self.instance.contract_id().clone(), account.clone()),
        })
    }

    pub fn id(&self) -> Bytes32 {
        self.instance.contract_id().hash
    }

    pub fn contract_id(&self) -> &Bech32ContractId {
        self.instance.contract_id()
    }

    pub async fn deploy_tokens(
        &self,
        wallet: &WalletUnlocked,
    ) -> (HashMap<String, Asset>, Vec<CollateralConfiguration>) {
        let tokens_json_path =
            PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/token_sdk/tokens.json");
        let tokens_json = std::fs::read_to_string(tokens_json_path).unwrap();
        let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();

        let mut assets: HashMap<String, Asset> = HashMap::new();
        let mut asset_configs: Vec<CollateralConfiguration> = vec![];

        for config in token_configs {
            let symbol = config.symbol;

            let token =
                TokenAsset::new(wallet.clone(), self.instance.contract_id().into(), &symbol);

            let asset_id = if symbol == "ETH" {
                AssetId::from_str(&config.asset_id).unwrap()
            } else {
                token.asset_id
            };

            // Everything except USDC is collateral
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

        (assets, asset_configs)
    }

    pub async fn load_tokens(
        &self,
        tokens_json_path: &str,
        wallet: &WalletUnlocked,
    ) -> (HashMap<String, Asset>, Vec<CollateralConfiguration>) {
        let tokens_json = std::fs::read_to_string(tokens_json_path).unwrap();
        let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();

        let mut assets: HashMap<String, Asset> = HashMap::new();
        let mut asset_configs: Vec<CollateralConfiguration> = Vec::new();

        for config in token_configs {
            let symbol = config.symbol;

            let token =
                TokenAsset::new(wallet.clone(), self.instance.contract_id().into(), &symbol);

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
}
