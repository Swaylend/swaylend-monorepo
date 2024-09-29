mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::ContractId,
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
    println!("UPDATE MARKET CONFIGURATION");

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

    let curr_market_config = market_instance
        .methods()
        .get_market_configuration()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;
    let pyth_contract_id = market_instance
        .methods()
        .get_pyth_contract_id()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;
    let pause_config = market_instance
        .methods()
        .get_pause_configuration()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;

    let market_config = read_market_config(&args.config_path)?;

    // market configuration
    if curr_market_config != market_config {
        println!("Updating market configuration",);
        println!("Old market configuration: {:#?}", curr_market_config);
        println!("New market configuration: {:#?}", market_config);
        if get_yes_no_input("Do you really want to market configuration? (yes/no): ") {
            market_instance
                .methods()
                .update_market_configuration(market_config.clone().into())
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?;
        }
    }

    // pyth contract id
    if pyth_contract_id
        != ContractId::from_str(market_config.clone().pyth_contract_id.as_str()).unwrap()
    {
        println!("Updating pyth contract id",);
        println!("Old pyth contract id: {:#?}", pyth_contract_id);
        println!(
            "New pyth contract id: {:#?}",
            ContractId::from_str(market_config.clone().pyth_contract_id.as_str()).unwrap()
        );
        if get_yes_no_input("Do you really want to update pyth contract id? (yes/no): ") {
            market_instance
                .methods()
                .set_pyth_contract_id(
                    ContractId::from_str(market_config.pyth_contract_id.as_str()).unwrap(),
                )
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?;
        }
    }

    // pause configuration
    if pause_config.supply_paused != market_config.supply_paused
        || pause_config.withdraw_paused != market_config.withdraw_paused
        || pause_config.absorb_paused != market_config.absorb_paused
        || pause_config.buy_paused != market_config.buy_paused
    {
        println!("Updating pause configuration",);
        println!("Old pause configuration: {:#?}", pause_config);
        println!(
            "New pause configuration: {:#?}",
            (
                market_config.supply_paused,
                market_config.withdraw_paused,
                market_config.absorb_paused,
                market_config.buy_paused
            )
        );
        if get_yes_no_input("Do you really want to update pause configuration? (yes/no): ") {
            market_instance
                .methods()
                .pause(market_config.clone().into())
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?;
        }
    }

    // read values to see if they are set correctly
    let market_configuration = market_instance
        .methods()
        .get_market_configuration()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;
    println!("Market configuration: {:#?}", market_configuration);
    let pyth_contract_id = market_instance
        .methods()
        .get_pyth_contract_id()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;
    println!("Pyth contract id: {:#?}", pyth_contract_id);
    let pause_config = market_instance
        .methods()
        .get_pause_configuration()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;
    println!("Pause configuration: {:#?}", pause_config);

    println!("Market updated successfully");

    Ok(())
}
