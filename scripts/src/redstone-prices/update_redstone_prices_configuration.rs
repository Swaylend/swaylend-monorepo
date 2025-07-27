use clap::Parser;
use fuels::{
    accounts::{provider::Provider, signers::private_key::PrivateKeySigner, wallet::Wallet},
    crypto::SecretKey,
    types::Bits256,
};
use std::str::FromStr;
use swaylend_scripts::utils::{
    redstone_prices::{get_redstone_prices_instance, read_redstone_prices_config, Args},
    shared::{get_yes_no_input, read_env, verify_connected_network},
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
    println!("ACTIVATING REDSTONE PRICES");

    read_env();

    let args = ArgsExtended::parse();

    let provider = Provider::connect(&args.args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.args.signing_key).unwrap();
    let wallet = Wallet::new(PrivateKeySigner::new(secret), provider.clone());

    let (redstone_prices_instance, redstone_prices_contract_id) = get_redstone_prices_instance(
        &wallet,
        args.args.redstone_prices_proxy_contract_id,
        args.args.redstone_prices_target_contract_id,
    )
    .await?;

    let contract_version = redstone_prices_instance
        .methods()
        .get_version()
        .with_contract_ids(&[redstone_prices_contract_id.clone()])
        .call()
        .await;
    println!(
        "Sanity check: working on contract version: {:?}",
        contract_version.unwrap().value
    );

    let redstone_prices_config = read_redstone_prices_config(&args.config_path)?;

    let curr_allowed_signers = redstone_prices_instance
        .methods()
        .get_allowed_signers()
        .with_contract_ids(&[redstone_prices_contract_id.clone()])
        .call()
        .await?
        .value;

    let curr_signer_count_threshold = redstone_prices_instance
        .methods()
        .get_signer_count_threshold()
        .with_contract_ids(&[redstone_prices_contract_id.clone()])
        .call()
        .await?
        .value;

    let new_allowed_signers = redstone_prices_config
        .allowed_signers
        .iter()
        .map(|signer| Bits256::from_hex_str(signer).unwrap())
        .collect();

    println!(
        "Current allowed signers: {:#?}\nCurrent signer count threshold: {:?}",
        curr_allowed_signers, curr_signer_count_threshold
    );

    println!(
        "New allowed signers: {:#?}\nNew signer count threshold: {:?}",
        new_allowed_signers, redstone_prices_config.signer_count_threshold
    );

    if !get_yes_no_input(
        "Do you want to update redstone prices configuration with the config above? (yes/no): ",
    ) {
        return Ok(());
    }

    // update redstone prices configuration
    redstone_prices_instance
        .methods()
        .update_configuration(
            redstone_prices_config.signer_count_threshold,
            new_allowed_signers,
        )
        .with_contract_ids(&[redstone_prices_contract_id.clone()])
        .call()
        .await?;

    Ok(())
}
