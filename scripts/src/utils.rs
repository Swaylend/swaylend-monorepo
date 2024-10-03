use clap::Parser;
use dotenv::dotenv;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    types::{bech32::Bech32ContractId, AssetId, Bits256, ContractId, U256},
};
use market::{CollateralConfiguration, MarketConfiguration, MarketContract, PauseConfiguration, I256};
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
        "Mainnet" => Ok(network == Network::Mainnet),
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

pub fn i256_indent() -> U256 {
    U256::from_big_endian(
        &hex::decode("8000000000000000000000000000000000000000000000000000000000000000").unwrap(),
    )
}

pub fn convert_i256_to_u64(value: &I256) -> u64 {
    let value = value.underlying - i256_indent();

    u64::try_from(value).unwrap()
}

#[allow(dead_code)]
fn main() {
    println!("good utils for deployment. just ignore this fn");
}
