use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    macros::abigen,
    types::{bech32::Bech32ContractId, transaction::TxPolicies, Address, Bits256, ContractId},
};
use serde::Deserialize;
use std::{path::PathBuf, str::FromStr};

abigen!(Contract(
    name = "MarketContract",
    abi = "contracts/market/out/release/market-abi.json"
));

#[derive(Deserialize)]
struct MarketConfig {
    supply_kink: u64,
    borrow_kink: u64,
    supply_per_second_interest_rate_slope_low: u64, // decimals: 18
    supply_per_second_interest_rate_slope_high: u64, // decimals: 18
    supply_per_second_interest_rate_base: u64,      // decimals: 18
    borrow_per_second_interest_rate_slope_low: u64, // decimals: 18
    borrow_per_second_interest_rate_slope_high: u64, // decimals: 18
    borrow_per_second_interest_rate_base: u64,      // decimals: 18
    store_front_price_factor: u64,                  // decimals: 4
    base_tracking_index_scale: u64,                 // decimals: 18
    base_tracking_supply_speed: u64,                // decimals: 18
    base_tracking_borrow_speed: u64,                // decimals: 18
    base_min_for_rewards: u64,                      // decimals base_token_decimals
    base_borrow_min: u64,                           // decimals base_token_decimals
    target_reserves: u64,
}

pub fn get_market_config(
    governor: Address,
    pause_guardian: Address,
    base_token_bits256: Bits256,
    base_token_decimals: u32,
    base_token_price_feed_id: Bits256,
) -> anyhow::Result<MarketConfiguration> {
    let config_json_path =
        PathBuf::from(env!("CARGO_WORKSPACE_DIR")).join("contracts/market/tests/config.json");
    let config_json_str = std::fs::read_to_string(config_json_path)?;
    let config: MarketConfig = serde_json::from_str(&config_json_str)?;

    Ok(MarketConfiguration {
        governor,
        pause_guardian,
        base_token: base_token_bits256,
        base_token_decimals,
        base_token_price_feed_id,
        supply_kink: config.supply_kink.into(),
        borrow_kink: config.borrow_kink.into(),
        supply_per_second_interest_rate_slope_low: config
            .supply_per_second_interest_rate_slope_low
            .into(),
        supply_per_second_interest_rate_slope_high: config
            .supply_per_second_interest_rate_slope_high
            .into(),
        supply_per_second_interest_rate_base: config.supply_per_second_interest_rate_base.into(),
        borrow_per_second_interest_rate_slope_low: config
            .borrow_per_second_interest_rate_slope_low
            .into(),
        borrow_per_second_interest_rate_slope_high: config
            .borrow_per_second_interest_rate_slope_high
            .into(),
        borrow_per_second_interest_rate_base: config.borrow_per_second_interest_rate_base.into(),
        store_front_price_factor: config.store_front_price_factor.into(),
        base_tracking_index_scale: config.base_tracking_index_scale.into(),
        base_tracking_supply_speed: config.base_tracking_supply_speed.into(),
        base_tracking_borrow_speed: config.base_tracking_borrow_speed.into(),
        base_min_for_rewards: config.base_min_for_rewards.into(),
        base_borrow_min: config.base_borrow_min.into(),
        target_reserves: config.target_reserves.into(),
    })
}

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(short, long, default_value = "127.0.0.1:4000")]
    pub provider_url: String,
    #[arg(short, long, required = true, env = "SIGNING_KEY")]
    pub signing_key: String,
    #[arg(long, required = true)]
    pub proxy_contract_id: String,
    #[arg(long, required = true)]
    pub target_contract_id: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    let provider = Provider::connect(&args.provider_url).await.unwrap();
    let secret = SecretKey::from_str(&args.signing_key).unwrap();
    let signing_wallet = WalletUnlocked::new_from_private_key(secret, Some(provider));

    let proxy_contract_id: Bech32ContractId = ContractId::from_str(&args.proxy_contract_id)
        .unwrap()
        .into();

    let contract_instance = MarketContract::new(proxy_contract_id, signing_wallet.clone());

    let target_contract_id: Bech32ContractId = ContractId::from_str(&args.target_contract_id)
        .unwrap()
        .into();

    let contract_version = contract_instance
        .methods()
        .get_version()
        .with_contract_ids(&[target_contract_id.clone()])
        .call()
        .await;
    println!("Contract version: {:?}", contract_version.unwrap().value);

    let tx_policies = TxPolicies::default().with_script_gas_limit(2_000_000);

    let market_configuration = get_market_config(
        signing_wallet.address().into(),
        signing_wallet.address().into(),
        Bits256::zeroed(),
        Default::default(),
        Bits256::zeroed(),
    );

    println!("Market configuration: {:?}", market_configuration);

    let result = contract_instance
        .methods()
        .activate_contract(market_configuration.unwrap())
        .with_contract_ids(&[target_contract_id.clone()])
        .call()
        .await;

    println!("Contract activation result: {:?}", result);

    println!(
        "Active market configuration: {:?}",
        contract_instance
            .methods()
            .get_market_configuration()
            .with_contract_ids(&[target_contract_id.clone()])
            .with_tx_policies(tx_policies)
            .call()
            .await
    );

    println!(
        "Active market configuration: {:?}",
        contract_instance
            .methods()
            .balance_of(Bits256::zeroed())
            .with_contract_ids(&[target_contract_id])
            .with_tx_policies(tx_policies)
            .call()
            .await
            .unwrap()
            .value
    );

    Ok(())
}
