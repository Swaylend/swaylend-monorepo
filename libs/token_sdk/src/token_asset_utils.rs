use token::*;

use fuels::accounts::wallet::WalletUnlocked;
use fuels::prelude::TxPolicies;
use fuels::programs::responses::CallResponse;
use fuels::types::transaction_builders::VariableOutputPolicy;
use fuels::types::{Address, AssetId, ContractId, Identity};
use serde::Deserialize;
use std::path::PathBuf;

use crate::get_symbol_hash;

#[derive(Deserialize)]
pub struct TokenConfig {
    #[allow(dead_code)]
    pub asset_id: String,
    #[allow(dead_code)]
    pub name: String,
    pub symbol: String,
    pub decimals: u64,
}

pub struct TokenAsset {
    pub asset_id: AssetId,
    pub decimals: u64,
    pub symbol: String,
    pub instance: Token<WalletUnlocked>,
}

impl TokenAsset {
    pub fn new(wallet: WalletUnlocked, token_contract_id: ContractId, symbol: &str) -> Self {
        let tokens_path =
            PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/token_sdk/tokens.json");

        let tokens_json = std::fs::read_to_string(tokens_path).unwrap();
        let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();

        // Find token config
        let config = token_configs
            .into_iter()
            .find(|config| config.symbol == symbol)
            .unwrap();

        let instance = Token::new(token_contract_id, wallet.clone());
        let asset_id = instance.contract_id().asset_id(&get_symbol_hash(&symbol));

        TokenAsset {
            asset_id,
            decimals: config.decimals,
            symbol: config.symbol,
            instance,
        }
    }

    pub async fn set_decimals(
        &self,
        decimals: u8,
    ) -> Result<CallResponse<()>, fuels::types::errors::Error> {
        let symbol_hash = get_symbol_hash(&self.symbol);

        self.instance
            .methods()
            .set_decimals(symbol_hash, decimals)
            .with_tx_policies(TxPolicies::default().with_tip(1))
            .call()
            .await
    }

    pub async fn set_name(
        &self,
        name: String,
    ) -> Result<CallResponse<()>, fuels::types::errors::Error> {
        let symbol_hash = get_symbol_hash(&self.symbol);

        self.instance
            .methods()
            .set_name(symbol_hash, name)
            .with_tx_policies(TxPolicies::default().with_tip(1))
            .call()
            .await
    }

    pub async fn set_symbol(
        &self,
        symbol: String,
    ) -> Result<CallResponse<()>, fuels::types::errors::Error> {
        let symbol_hash = get_symbol_hash(&self.symbol);

        self.instance
            .methods()
            .set_name(symbol_hash, symbol)
            .with_tx_policies(TxPolicies::default().with_tip(1))
            .call()
            .await
    }

    pub async fn mint(
        &self,
        recipient: Address,
        amount: u64,
    ) -> Result<CallResponse<()>, fuels::types::errors::Error> {
        let symbol_hash = get_symbol_hash(&self.symbol);
        self.instance
            .methods()
            .mint(Identity::Address(recipient), Some(symbol_hash), amount)
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .with_tx_policies(TxPolicies::default().with_tip(1))
            .call()
            .await
    }

    pub fn parse_units(&self, value: f64) -> f64 {
        value * 10_f64.powf(self.decimals as f64)
    }

    pub fn format_units(&self, value: f64) -> f64 {
        value / 10_f64.powf(self.decimals as f64)
    }
}
