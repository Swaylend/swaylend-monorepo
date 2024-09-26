mod utils;

abigen!(Contract(
    name = "MarketContract",
    abi = "contracts/market/out/release/market-abi.json"
));

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    macros::abigen,
    types::{bech32::Bech32ContractId, transaction::TxPolicies, AssetId, Bits256, ContractId},
};
use std::str::FromStr;
use utils::{get_market_instance, read_env, read_market_config, verify_connected_network, Args};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[arg(long, required = true)]
    pub config_path: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    read_env();

    let args = ArgsExtended::parse();

    let provider = Provider::connect(&args.args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.args.signing_key).unwrap();
    let wallet = WalletUnlocked::new_from_private_key(secret, Some(provider));

    let (market_instance, market_contract_id) = get_market_instance(
        wallet,
        args.args.proxy_contract_id,
        args.args.target_contract_id,
    )
    .await?;

    let contract_version = market_instance
        .methods()
        .get_version()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await;
    println!(
        "Sanity check: contract version: {:?}",
        contract_version.unwrap().value
    );

    let market_config = read_market_config(&args.config_path)?;

    println!("Market configuration: {:?}", market_config);

    // let provider = Provider::connect(&args.provider_url).await.unwrap();

    // let mut contract_id: Bech32ContractId = ContractId::from_str(&args.target_contract_id)
    //     .unwrap()
    //     .into();
    // if args.is_upgradeable && args.proxy_contract_id.is_some() {
    //     contract_id = ContractId::from_str(&args.proxy_contract_id.unwrap())
    //         .unwrap()
    //         .into();
    // }

    let oracle_id = ContractId::from_str(&market_config.pyth_contract_id).unwrap();

    // let target_contract_id: Bech32ContractId = ContractId::from_str(&args.target_contract_id)
    //     .unwrap()
    //     .into();

    let tx_policies = TxPolicies::default().with_script_gas_limit(2_000_000);

    // // TODO[urban,vid]: take in consideration the decimals when mainnet is ready
    // let base_token_decimals = 6;
    // let base_token_price_feed_id = Bits256::from_hex_str(&args.base_token_price_feed).unwrap();

    // let market_configuration = get_market_config(
    //     AssetId::from_str(&args.base_token_id).unwrap(),
    //     base_token_decimals,
    //     base_token_price_feed_id,
    // );

    // println!("Market configuration: {:?}", market_configuration);

    // let result = contract_instance
    //     .methods()
    //     .activate_contract(
    //         market_configuration.unwrap(),
    //         signing_wallet.address().into(),
    //     )
    //     .with_contract_ids(&[target_contract_id.clone()])
    //     .call()
    //     .await;

    // println!("Contract activation result: {:?}", result);

    let result = market_instance
        .methods()
        .set_pyth_contract_id(oracle_id)
        .with_contract_ids(&[market_contract_id.clone()])
        .with_tx_policies(tx_policies)
        .call()
        .await?;

    // println!("Set Pyth contract ID result: {:?}", result);

    // println!(
    //     "Active market configuration: {:?}",
    //     contract_instance
    //         .methods()
    //         .get_market_configuration()
    //         .with_contract_ids(&[target_contract_id.clone()])
    //         .with_tx_policies(tx_policies)
    //         .call()
    //         .await
    // );

    // println!(
    //     "Active market configuration: {:?}",
    //     contract_instance
    //         .methods()
    //         .balance_of(AssetId::zeroed())
    //         .with_contract_ids(&[target_contract_id])
    //         .with_tx_policies(tx_policies)
    //         .call()
    //         .await
    //         .unwrap()
    //         .value
    // );

    Ok(())
}
