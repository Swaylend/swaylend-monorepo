mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::{Address, ContractId, Identity},
};
use std::str::FromStr;
use utils::{get_proxy_instance, get_yes_no_input, read_env, verify_connected_network, Args};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[arg(long, required = true)]
    pub new_owner: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("CHANGING PROXY OWNER");

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

    let (proxy_instance, _proxy_contract_id) =
        get_proxy_instance(&wallet, args.args.proxy_contract_id).await?;

    let curr_owner = proxy_instance
        .methods()
        .proxy_owner()
        .call()
        .await
        .unwrap()
        .value;

    println!("Current proxy owner: {:?}", curr_owner);

    if !get_yes_no_input(
        format!(
            "Do you want to change proxy owner {:?} -> {:?}? (yes/no): ",
            curr_owner, new_owner
        )
        .as_str(),
    ) {
        return Ok(());
    }

    proxy_instance
        .methods()
        .set_proxy_owner(utils::State::Initialized(new_owner))
        .call()
        .await
        .unwrap();

    println!(
        "New proxy owner: {:?}",
        proxy_instance
            .methods()
            .proxy_owner()
            .call()
            .await
            .unwrap()
            .value
    );

    println!("Proxy owner successfully changed!");

    Ok(())
}
