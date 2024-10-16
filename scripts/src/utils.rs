use clap::Parser;
use dotenv::dotenv;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    macros::abigen,
    types::{bech32::Bech32ContractId, AssetId, Bits256, ContractId, U256},
};
use market::{
    CollateralConfiguration, MarketConfiguration, MarketContract, PauseConfiguration, I256,
};
use serde::Deserialize;
use std::{io::Write, path::PathBuf, str::FromStr};

pub fn get_yes_no_input(prompt: &str) -> bool {
    loop {
        print!("{}", prompt);
        std::io::stdout().flush().unwrap(); // Ensure prompt is shown before reading input

        let mut input = String::new();
        std::io::stdin()
            .read_line(&mut input)
            .expect("Failed to read input");

        let input = input.trim().to_lowercase(); // Trim spaces and normalize to lowercase

        match input.as_str() {
            "yes" | "y" => return true,
            "no" | "n" => return false,
            _ => println!("Please enter 'yes' or 'no'."),
        }
    }
}

#[derive(clap::ValueEnum, Clone, Debug, Eq, PartialEq)]
pub enum Network {
    Mainnet,
    Testnet,
    Devnet,
}

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(long, env = "PROVIDER_URL", default_value = "http://127.0.0.1:4000")]
    pub provider_url: String,
    #[clap(value_enum)]
    #[arg(long, env = "NETWORK", default_value = "devnet")]
    pub network: Network,
    #[arg(long, required = true, env = "SIGNING_KEY")]
    pub signing_key: String,
    #[arg(long, required = true, env = "PROXY_CONTRACT_ID")]
    pub proxy_contract_id: String,
    #[arg(long, required = true, env = "TARGET_CONTRACT_ID")]
    pub target_contract_id: String,
}

pub fn read_env() {
    dotenv().ok();
}

#[derive(Deserialize, Clone, Debug)]
pub struct BaseAssetConfig {
    pub asset_id: String,
    pub price_feed_id: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}

#[derive(Deserialize, Clone, Debug)]
pub struct CollateralAssetConfig {
    pub asset_id: String,
    pub price_feed_id: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub borrow_collateral_factor: u128,
    pub liquidate_collateral_factor: u128,
    pub liquidation_penalty: u128,
    pub supply_cap: u64,
    pub is_active: bool,
}

#[derive(Deserialize, Clone, Debug)]
pub struct MarketConfig {
    pub supply_paused: bool,
    pub withdraw_paused: bool,
    pub absorb_paused: bool,
    pub buy_paused: bool,
    pub supply_kink: u128,
    pub borrow_kink: u128,
    pub supply_per_second_interest_rate_slope_low: u128,
    pub supply_per_second_interest_rate_slope_high: u128,
    pub supply_per_second_interest_rate_base: u128,
    pub borrow_per_second_interest_rate_slope_low: u128,
    pub borrow_per_second_interest_rate_slope_high: u128,
    pub borrow_per_second_interest_rate_base: u128,
    pub store_front_price_factor: u128,
    pub base_tracking_index_scale: u128,
    pub base_tracking_supply_speed: u128,
    pub base_tracking_borrow_speed: u128,
    pub base_min_for_rewards: u64,
    pub base_borrow_min: u64,
    pub target_reserves: u64,
    pub pyth_contract_id: String,
    pub base_asset: BaseAssetConfig,
    pub collateral_assets: Vec<CollateralAssetConfig>,
}

impl From<MarketConfig> for MarketConfiguration {
    fn from(config: MarketConfig) -> Self {
        MarketConfiguration {
            supply_kink: config.supply_kink.into(),
            borrow_kink: config.borrow_kink.into(),
            supply_per_second_interest_rate_slope_low: config
                .supply_per_second_interest_rate_slope_low
                .into(),
            supply_per_second_interest_rate_slope_high: config
                .supply_per_second_interest_rate_slope_high
                .into(),
            supply_per_second_interest_rate_base: config
                .supply_per_second_interest_rate_base
                .into(),
            borrow_per_second_interest_rate_slope_low: config
                .borrow_per_second_interest_rate_slope_low
                .into(),
            borrow_per_second_interest_rate_slope_high: config
                .borrow_per_second_interest_rate_slope_high
                .into(),
            borrow_per_second_interest_rate_base: config
                .borrow_per_second_interest_rate_base
                .into(),
            store_front_price_factor: config.store_front_price_factor.into(),
            base_tracking_index_scale: config.base_tracking_index_scale.into(),
            base_tracking_supply_speed: config.base_tracking_supply_speed.into(),
            base_tracking_borrow_speed: config.base_tracking_borrow_speed.into(),
            base_min_for_rewards: config.base_min_for_rewards.into(),
            base_borrow_min: config.base_borrow_min.into(),
            target_reserves: config.target_reserves.into(),
            base_token: AssetId::from_str(config.base_asset.asset_id.as_str()).unwrap(),
            base_token_decimals: config.base_asset.decimals,
            base_token_price_feed_id: Bits256::from_hex_str(
                config.base_asset.price_feed_id.as_str(),
            )
            .unwrap(),
        }
    }
}

impl From<MarketConfig> for PauseConfiguration {
    fn from(config: MarketConfig) -> Self {
        PauseConfiguration {
            supply_paused: config.supply_paused,
            withdraw_paused: config.withdraw_paused,
            absorb_paused: config.absorb_paused,
            buy_paused: config.buy_paused,
        }
    }
}

impl From<CollateralAssetConfig> for CollateralConfiguration {
    fn from(value: CollateralAssetConfig) -> Self {
        CollateralConfiguration {
            asset_id: AssetId::from_str(value.asset_id.as_str()).unwrap(),
            price_feed_id: Bits256::from_hex_str(value.price_feed_id.as_str()).unwrap(),
            decimals: value.decimals,
            borrow_collateral_factor: value.borrow_collateral_factor.into(),
            liquidate_collateral_factor: value.liquidate_collateral_factor.into(),
            liquidation_penalty: value.liquidation_penalty.into(),
            supply_cap: value.supply_cap.into(),
            paused: !value.is_active,
        }
    }
}

impl PartialEq<MarketConfig> for MarketConfiguration {
    fn eq(&self, other: &MarketConfig) -> bool {
        self.supply_kink == other.supply_kink.into()
            && self.borrow_kink == other.borrow_kink.into()
            && self.supply_per_second_interest_rate_slope_low
                == other.supply_per_second_interest_rate_slope_low.into()
            && self.supply_per_second_interest_rate_slope_high
                == other.supply_per_second_interest_rate_slope_high.into()
            && self.supply_per_second_interest_rate_base
                == other.supply_per_second_interest_rate_base.into()
            && self.borrow_per_second_interest_rate_slope_low
                == other.borrow_per_second_interest_rate_slope_low.into()
            && self.borrow_per_second_interest_rate_slope_high
                == other.borrow_per_second_interest_rate_slope_high.into()
            && self.borrow_per_second_interest_rate_base
                == other.borrow_per_second_interest_rate_base.into()
            && self.store_front_price_factor == other.store_front_price_factor.into()
            && self.base_tracking_index_scale == other.base_tracking_index_scale.into()
            && self.base_tracking_supply_speed == other.base_tracking_supply_speed.into()
            && self.base_tracking_borrow_speed == other.base_tracking_borrow_speed.into()
            && self.base_min_for_rewards == other.base_min_for_rewards.into()
            && self.base_borrow_min == other.base_borrow_min.into()
            && self.target_reserves == other.target_reserves.into()
            && self.base_token == AssetId::from_str(other.base_asset.asset_id.as_str()).unwrap()
            && self.base_token_decimals == other.base_asset.decimals
            && self.base_token_price_feed_id
                == Bits256::from_hex_str(other.base_asset.price_feed_id.as_str()).unwrap()
    }
}

impl PartialEq<MarketConfiguration> for MarketConfig {
    fn eq(&self, other: &MarketConfiguration) -> bool {
        other.supply_kink == self.supply_kink.into()
            && other.borrow_kink == self.borrow_kink.into()
            && other.supply_per_second_interest_rate_slope_low
                == self.supply_per_second_interest_rate_slope_low.into()
            && other.supply_per_second_interest_rate_slope_high
                == self.supply_per_second_interest_rate_slope_high.into()
            && other.supply_per_second_interest_rate_base
                == self.supply_per_second_interest_rate_base.into()
            && other.borrow_per_second_interest_rate_slope_low
                == self.borrow_per_second_interest_rate_slope_low.into()
            && other.borrow_per_second_interest_rate_slope_high
                == self.borrow_per_second_interest_rate_slope_high.into()
            && other.borrow_per_second_interest_rate_base
                == self.borrow_per_second_interest_rate_base.into()
            && other.store_front_price_factor == self.store_front_price_factor.into()
            && other.base_tracking_index_scale == self.base_tracking_index_scale.into()
            && other.base_tracking_supply_speed == self.base_tracking_supply_speed.into()
            && other.base_tracking_borrow_speed == self.base_tracking_borrow_speed.into()
            && other.base_min_for_rewards == self.base_min_for_rewards.into()
            && other.base_borrow_min == self.base_borrow_min.into()
            && other.target_reserves == self.target_reserves.into()
            && AssetId::from_str(self.base_asset.asset_id.as_str()).unwrap() == other.base_token
            && self.base_asset.decimals == other.base_token_decimals
            && Bits256::from_hex_str(self.base_asset.price_feed_id.as_str()).unwrap()
                == other.base_token_price_feed_id
    }
}

impl PartialEq<CollateralAssetConfig> for CollateralConfiguration {
    fn eq(&self, other: &CollateralAssetConfig) -> bool {
        self.asset_id == AssetId::from_str(other.asset_id.as_str()).unwrap()
            && self.price_feed_id == Bits256::from_hex_str(other.price_feed_id.as_str()).unwrap()
            && self.decimals == other.decimals
            && self.borrow_collateral_factor == other.borrow_collateral_factor.into()
            && self.liquidate_collateral_factor == other.liquidate_collateral_factor.into()
            && self.liquidation_penalty == other.liquidation_penalty.into()
            && self.supply_cap == other.supply_cap
            && self.paused == !other.is_active
    }
}

impl PartialEq<CollateralConfiguration> for CollateralAssetConfig {
    fn eq(&self, other: &CollateralConfiguration) -> bool {
        AssetId::from_str(self.asset_id.as_str()).unwrap() == other.asset_id
            && Bits256::from_hex_str(self.price_feed_id.as_str()).unwrap() == other.price_feed_id
            && self.decimals == other.decimals
            && other.borrow_collateral_factor == self.borrow_collateral_factor.into()
            && other.liquidate_collateral_factor == self.liquidate_collateral_factor.into()
            && other.liquidation_penalty == self.liquidation_penalty.into()
            && self.supply_cap == other.supply_cap
            && self.is_active == !other.paused
    }
}

pub fn read_market_config(path: &str) -> anyhow::Result<MarketConfig> {
    let config_path = PathBuf::from(path);
    let config_str = std::fs::read_to_string(config_path)?;
    serde_json::from_str(&config_str)
        .map_err(|e| anyhow::anyhow!("Failed to parse market config: {}", e))
}

pub async fn verify_connected_network(
    provider: &Provider,
    network: Network,
) -> anyhow::Result<bool> {
    let chain_name = provider.chain_info().await?.name;
    println!("Connected to chain: {}", chain_name);
    match chain_name.as_str() {
        "Ignition" => Ok(network == Network::Mainnet),
        "Fuel Sepolia Testnet" => Ok(network == Network::Testnet),
        "Local network" => Ok(network == Network::Devnet),
        _ => Ok(false),
    }
}

pub async fn get_market_instance(
    wallet: &WalletUnlocked,
    proxy_contract_id: String,
    target_contract_id: String,
) -> anyhow::Result<(MarketContract<WalletUnlocked>, Bech32ContractId)> {
    let proxy_contract_id: Bech32ContractId =
        ContractId::from_str(&proxy_contract_id).unwrap().into();
    let market_instance = MarketContract::new(proxy_contract_id, wallet.clone());
    let target_contract_id = ContractId::from_str(&target_contract_id).unwrap();

    Ok((market_instance, target_contract_id.into()))
}

abigen!(Contract(name = "ProxyContract", abi = "{\"programType\":\"contract\",\"specVersion\":\"1\",\"encodingVersion\":\"1\",\"concreteTypes\":[{\"type\":\"()\",\"concreteTypeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"},{\"type\":\"enum standards::src5::AccessError\",\"concreteTypeId\":\"3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d\",\"metadataTypeId\":1},{\"type\":\"enum standards::src5::State\",\"concreteTypeId\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\",\"metadataTypeId\":2},{\"type\":\"enum std::option::Option<struct std::contract_id::ContractId>\",\"concreteTypeId\":\"0d79387ad3bacdc3b7aad9da3a96f4ce60d9a1b6002df254069ad95a3931d5c8\",\"metadataTypeId\":4,\"typeArguments\":[\"29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54\"]},{\"type\":\"enum sway_libs::ownership::errors::InitializationError\",\"concreteTypeId\":\"1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893\",\"metadataTypeId\":5},{\"type\":\"enum sway_libs::upgradability::errors::SetProxyOwnerError\",\"concreteTypeId\":\"3c6e90ae504df6aad8b34a93ba77dc62623e00b777eecacfa034a8ac6e890c74\",\"metadataTypeId\":6},{\"type\":\"str\",\"concreteTypeId\":\"8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a\"},{\"type\":\"struct std::contract_id::ContractId\",\"concreteTypeId\":\"29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54\",\"metadataTypeId\":9},{\"type\":\"struct sway_libs::upgradability::events::ProxyOwnerSet\",\"concreteTypeId\":\"96dd838b44f99d8ccae2a7948137ab6256c48ca4abc6168abc880de07fba7247\",\"metadataTypeId\":10},{\"type\":\"struct sway_libs::upgradability::events::ProxyTargetSet\",\"concreteTypeId\":\"1ddc0adda1270a016c08ffd614f29f599b4725407c8954c8b960bdf651a9a6c8\",\"metadataTypeId\":11}],\"metadataTypes\":[{\"type\":\"b256\",\"metadataTypeId\":0},{\"type\":\"enum standards::src5::AccessError\",\"metadataTypeId\":1,\"components\":[{\"name\":\"NotOwner\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"enum standards::src5::State\",\"metadataTypeId\":2,\"components\":[{\"name\":\"Uninitialized\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"},{\"name\":\"Initialized\",\"typeId\":3},{\"name\":\"Revoked\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"enum std::identity::Identity\",\"metadataTypeId\":3,\"components\":[{\"name\":\"Address\",\"typeId\":8},{\"name\":\"ContractId\",\"typeId\":9}]},{\"type\":\"enum std::option::Option\",\"metadataTypeId\":4,\"components\":[{\"name\":\"None\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"},{\"name\":\"Some\",\"typeId\":7}],\"typeParameters\":[7]},{\"type\":\"enum sway_libs::ownership::errors::InitializationError\",\"metadataTypeId\":5,\"components\":[{\"name\":\"CannotReinitialized\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"enum sway_libs::upgradability::errors::SetProxyOwnerError\",\"metadataTypeId\":6,\"components\":[{\"name\":\"CannotUninitialize\",\"typeId\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\"}]},{\"type\":\"generic T\",\"metadataTypeId\":7},{\"type\":\"struct std::address::Address\",\"metadataTypeId\":8,\"components\":[{\"name\":\"bits\",\"typeId\":0}]},{\"type\":\"struct std::contract_id::ContractId\",\"metadataTypeId\":9,\"components\":[{\"name\":\"bits\",\"typeId\":0}]},{\"type\":\"struct sway_libs::upgradability::events::ProxyOwnerSet\",\"metadataTypeId\":10,\"components\":[{\"name\":\"new_proxy_owner\",\"typeId\":2}]},{\"type\":\"struct sway_libs::upgradability::events::ProxyTargetSet\",\"metadataTypeId\":11,\"components\":[{\"name\":\"new_target\",\"typeId\":9}]}],\"functions\":[{\"inputs\":[],\"name\":\"proxy_target\",\"output\":\"0d79387ad3bacdc3b7aad9da3a96f4ce60d9a1b6002df254069ad95a3931d5c8\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Returns the target contract of the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Returns\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * [Option<ContractId>] - The new proxy contract to which all fallback calls will be passed or `None`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"read\"]}]},{\"inputs\":[{\"name\":\"new_target\",\"concreteTypeId\":\"29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54\"}],\"name\":\"set_proxy_target\",\"output\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Change the target contract of the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Additional Information\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method can only be called by the `proxy_owner`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Arguments\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * `new_target`: [ContractId] - The new proxy contract to which all fallback calls will be passed.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Reverts\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When not called by `proxy_owner`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Write: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"read\",\"write\"]}]},{\"inputs\":[],\"name\":\"proxy_owner\",\"output\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Returns the owner of the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Returns\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * [State] - Represents the state of ownership for this contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"read\"]}]},{\"inputs\":[],\"name\":\"initialize_proxy\",\"output\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Initializes the proxy contract.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Additional Information\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method sets the storage values using the values of the configurable constants `INITIAL_TARGET` and `INITIAL_OWNER`.\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This then allows methods that write to storage to be called.\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method can only be called once.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Reverts\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When `storage::SRC14.proxy_owner` is not [State::Uninitialized].\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Writes: `2`\"]},{\"name\":\"storage\",\"arguments\":[\"write\"]}]},{\"inputs\":[{\"name\":\"new_proxy_owner\",\"concreteTypeId\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\"}],\"name\":\"set_proxy_owner\",\"output\":\"2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d\",\"attributes\":[{\"name\":\"doc-comment\",\"arguments\":[\" Changes proxy ownership to the passed State.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Additional Information\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" This method can be used to transfer ownership between Identities or to revoke ownership.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Arguments\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * `new_proxy_owner`: [State] - The new state of the proxy ownership.\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Reverts\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When the sender is not the current proxy owner.\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * When the new state of the proxy ownership is [State::Uninitialized].\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" # Number of Storage Accesses\"]},{\"name\":\"doc-comment\",\"arguments\":[\"\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Reads: `1`\"]},{\"name\":\"doc-comment\",\"arguments\":[\" * Writes: `1`\"]},{\"name\":\"storage\",\"arguments\":[\"write\"]}]}],\"loggedTypes\":[{\"logId\":\"4571204900286667806\",\"concreteTypeId\":\"3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d\"},{\"logId\":\"2151606668983994881\",\"concreteTypeId\":\"1ddc0adda1270a016c08ffd614f29f599b4725407c8954c8b960bdf651a9a6c8\"},{\"logId\":\"2161305517876418151\",\"concreteTypeId\":\"1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893\"},{\"logId\":\"4354576968059844266\",\"concreteTypeId\":\"3c6e90ae504df6aad8b34a93ba77dc62623e00b777eecacfa034a8ac6e890c74\"},{\"logId\":\"10870989709723147660\",\"concreteTypeId\":\"96dd838b44f99d8ccae2a7948137ab6256c48ca4abc6168abc880de07fba7247\"},{\"logId\":\"10098701174489624218\",\"concreteTypeId\":\"8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a\"}],\"messagesTypes\":[],\"configurables\":[{\"name\":\"INITIAL_TARGET\",\"concreteTypeId\":\"0d79387ad3bacdc3b7aad9da3a96f4ce60d9a1b6002df254069ad95a3931d5c8\",\"offset\":13368},{\"name\":\"INITIAL_OWNER\",\"concreteTypeId\":\"192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c\",\"offset\":13320}]}",));

pub async fn get_proxy_instance(
    wallet: &WalletUnlocked,
    proxy_contract_id: String,
) -> anyhow::Result<(ProxyContract<WalletUnlocked>, Bech32ContractId)> {
    let proxy_contract_id: Bech32ContractId =
        ContractId::from_str(&proxy_contract_id).unwrap().into();
    let proxy_instance = ProxyContract::new(proxy_contract_id.clone(), wallet.clone());

    Ok((proxy_instance, proxy_contract_id))
}

pub fn i256_indent() -> U256 {
    U256::from_big_endian(
        &hex::decode("8000000000000000000000000000000000000000000000000000000000000000").unwrap(),
    )
}

pub fn convert_i256_to_u64(value: &I256) -> u64 {
    let value = value.underlying - i256_indent();

    u64::try_from(value).unwrap()
}

pub fn convert_i256_to_i64(value: &I256) -> i64 {
    let value = value.underlying - i256_indent();

    i64::try_from(value).unwrap()
}

#[allow(dead_code)]
fn main() {
    println!("good utils for deployment. just ignore this fn");
}
