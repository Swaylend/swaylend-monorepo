mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::{transaction::TxPolicies, AssetId, ContractId},
};
use std::str::FromStr;
use utils::{
    get_market_instance, get_yes_no_input, read_env, read_market_config, verify_connected_network,
    Args,
};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[arg(long, required = true)]
    pub config_path: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("ACTIVATING MARKET");

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
        &wallet,
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
        "Sanity check: working on contract version: {:?}",
        contract_version.unwrap().value
    );

    let market_config = read_market_config(&args.config_path)?;

    println!("Market configuration: {:#?}", market_config);

    if !get_yes_no_input("Do you want to activate market with the config above? (yes/no): ") {
        return Ok(());
    }

    let tx_policies = TxPolicies::default().with_script_gas_limit(2_000_000);

    // activate contract
    market_instance
        .methods()
        .activate_contract(market_config.clone().into(), wallet.address().into())
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?;

    // set pyth contract id
    let oracle_id = ContractId::from_str(&market_config.pyth_contract_id).unwrap();
    market_instance
        .methods()
        .set_pyth_contract_id(oracle_id)
        .with_contract_ids(&[market_contract_id.clone()])
        .with_tx_policies(tx_policies)
        .call()
        .await?;

    // read values to see if they are set correctly
    assert_eq!(
        market_instance
            .methods()
            .get_market_configuration()
            .with_contract_ids(&[market_contract_id.clone()])
            .call()
            .await?
            .value
            .base_token,
        AssetId::from_str(market_config.base_asset.asset_id.as_str()).unwrap()
    );

    println!("Market activated successfully!");

    Ok(())
}
