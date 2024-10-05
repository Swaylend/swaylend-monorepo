mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::{Address, ContractId, Identity},
};
use std::str::FromStr;
use utils::{get_market_instance, get_yes_no_input, read_env, verify_connected_network, Args};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[arg(long, required = true)]
    pub new_owner: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("CHANGING MARKET OWNER");

    read_env();

    let args = ArgsExtended::parse();

    let provider = Provider::connect(&args.args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.args.signing_key).unwrap();
    let wallet = WalletUnlocked::new_from_private_key(secret, Some(provider));

    let new_owner: Identity = {
        let mut parts = args.new_owner.split(":");
        let identity_type = parts.next().unwrap_or("");
        let val = parts.next().unwrap_or("");
        match identity_type {
            "contract" => ContractId::from_str(val).unwrap().into(),
            "address" => Address::from_str(val).unwrap().into(),
            _ => panic!("Wrong identity type!"),
        }
    };

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

    let curr_owner = market_instance
        .methods()
        .owner()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await
        .unwrap()
        .value;

    println!("Current market owner: {:?}", curr_owner);

    if !get_yes_no_input(
        format!(
            "Do you want to change market owner {:?} -> {:?}? (yes/no): ",
            curr_owner, new_owner
        )
        .as_str(),
    ) {
        return Ok(());
    }

    market_instance
        .methods()
        .transfer_ownership(new_owner)
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await
        .unwrap();

    println!(
        "New market owner: {:?}",
        market_instance
            .methods()
            .owner()
            .with_contract_ids(&[market_contract_id.clone()])
            .call()
            .await
            .unwrap()
            .value
    );

    println!("Market owner successfully changed!");

    Ok(())
}
