use fuels::accounts::wallet::WalletUnlocked;
use fuels::prelude::{abigen, Contract, LoadConfiguration, TxPolicies};
use fuels::programs::responses::CallResponse;
use fuels::types::transaction_builders::VariableOutputPolicy;
use fuels::types::{Address, AssetId, Bits256, ContractId, Identity};
use rand::Rng;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::path::PathBuf;

abigen!(Contract(
    name = "TokenContract",
    abi = "contracts/token/out/release/token-abi.json",
));

#[derive(Deserialize)]
pub struct TokenConfig {
    pub asset_id: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u64,
}

pub struct Asset {
    pub asset_id: AssetId,
    pub decimals: u64,
    pub symbol: String,
    pub token_contract_instance: Option<TokenContract<WalletUnlocked>>,
}

impl Asset {
    pub async fn mint(
        &self,
        recipient: Address,
        amount: u64,
    ) -> Result<CallResponse<()>, fuels::types::errors::Error> {
        let symbol_hash = get_symbol_hash(&self.symbol);
        self.token_contract_instance
            .as_ref()
            .unwrap()
            .methods()
            .mint(Identity::Address(recipient), symbol_hash, amount)
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

    pub fn new(wallet: WalletUnlocked, token_contract_id: ContractId, symbol: &str) -> Self {
        let tokens_path =
            PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("libs/src20_sdk/tokens.json");

        let tokens_json = std::fs::read_to_string(tokens_path).unwrap();
        let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();
        let config = token_configs
            .into_iter()
            .find(|config| config.symbol == symbol)
            .unwrap();

        let instance = TokenContract::new(token_contract_id, wallet.clone());
        let asset_id = instance.contract_id().asset_id(&get_symbol_hash(&symbol));

        Asset {
            asset_id,
            decimals: config.decimals,
            symbol: config.symbol,
            token_contract_instance: Option::Some(instance),
        }
    }
}

pub async fn deploy_token_contract(wallet: &WalletUnlocked) -> TokenContract<WalletUnlocked> {
    let mut rng = rand::thread_rng();
    let salt = rng.gen::<[u8; 32]>();
    let configurables = TokenContractConfigurables::default();
    let config = LoadConfiguration::default().with_configurables(configurables);
    let bin_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("contracts/token/out/release/token.bin");
    let id = Contract::load_from(bin_path, config)
        .unwrap()
        .with_salt(salt)
        .deploy(wallet, TxPolicies::default().with_tip(1))
        .await
        .unwrap();
    let instance = TokenContract::new(id.clone(), wallet.clone());
    instance
}

// pub async fn load_tokens(
//     tokens_json_path: &str,
//     price_feed: ContractId,
// ) -> (HashMap<String, Asset>, Vec<CollateralConfiguration>) {
//     let tokens_json = std::fs::read_to_string(tokens_json_path).unwrap();
//     let token_configs: Vec<TokenConfig> = serde_json::from_str(&tokens_json).unwrap();

//     let mut assets: HashMap<String, Asset> = HashMap::new();
//     let mut asset_configs: Vec<CollateralConfiguration> = Vec::new();

//     for config in token_configs {
//         let bits256 = Bits256::from_hex_str(&config.asset_id).unwrap();
//         let symbol = config.symbol;
//         assets.insert(
//             symbol.clone(),
//             Asset {
//                 bits256,
//                 asset_id: AssetId::from(bits256.0),
//                 default_price: config.default_price,
//                 decimals: config.decimals,
//                 symbol: symbol.clone(),
//                 coingeco_id: config.coingeco_id,
//             },
//         );

//         if symbol != "USDC" {
//             asset_configs.push(CollateralConfiguration {
//                 asset_id: bits256,
//                 decimals: config.decimals,
//                 price_feed,
//                 borrow_collateral_factor: config.borrow_collateral_factor.unwrap(), // decimals: 4
//                 liquidate_collateral_factor: config.liquidate_collateral_factor.unwrap(), // decimals: 4
//                 liquidation_penalty: config.liquidation_penalty.unwrap(), // decimals: 4
//                 supply_cap: config.supply_cap.unwrap(), // decimals: asset decimals
//                 paused: false,
//             })
//         }
//     }
//     (assets, asset_configs)
// }

fn get_symbol_hash(symbol: &str) -> Bits256 {
    let mut hasher = Sha256::new();
    hasher.update(symbol);
    let symbol_hash: [u8; 32] = hasher.finalize().into();
    let hash_asset_id = AssetId::from(symbol_hash);
    Bits256::from(hash_asset_id)
}

// TODO[old]
// fn construct_asset_id(contract_id: ContractId, symbol: &str) -> AssetId {
//     let symbol_hash = get_symbol_hash(symbol);
// }
