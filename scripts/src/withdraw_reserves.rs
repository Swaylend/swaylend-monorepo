mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::{transaction_builders::VariableOutputPolicy, Address, ContractId, Identity},
};
use std::str::FromStr;
use utils::{
    convert_i256_to_u64, get_market_instance, get_yes_no_input, read_env, verify_connected_network,
    Args,
};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[clap(long, required = true)]
    pub amount: u64,
    #[arg(long)]
    pub recipient: Option<String>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("WITHDRAWING RESERVES");

    read_env();

    let args = ArgsExtended::parse();

    let provider = Provider::connect(&args.args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.args.signing_key).unwrap();
    let wallet = WalletUnlocked::new_from_private_key(secret, Some(provider.clone()));

    let recipient: Identity = if let Some(recipient) = args.recipient.clone() {
        let mut parts = recipient.split(":");

        let identity_type = parts.next().unwrap_or("");
        let val = parts.next().unwrap_or("");

        match identity_type {
            "contract" => ContractId::from_str(val).unwrap().into(),
            "address" => Address::from_str(val).unwrap().into(),
            _ => panic!("Wrong identity type!"),
        }
    } else {
        wallet.address().into()
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

    let market_config = market_instance
        .methods()
        .get_market_configuration()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;

    println!(
        "Balance of the recipient: {}",
        match recipient {
            Identity::Address(addr) => provider
                .get_asset_balance(&addr.into(), market_config.base_token)
                .await
                .unwrap(),
            Identity::ContractId(id) => provider
                .get_contract_asset_balance(&id.into(), market_config.base_token)
                .await
                .unwrap(),
        }
    );

    println!(
        "Reserves balance: {}",
        convert_i256_to_u64(
            &market_instance
                .methods()
                .get_reserves()
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?
                .value
        )
    );

    println!(
        "Recipient is the following identity: {:?}",
        match recipient {
            Identity::Address(addr) => format!("address:{}", addr),
            Identity::ContractId(id) => format!("contract:{}", id),
        }
    );

    if !get_yes_no_input("Do you really want to withdraw reserves? (yes/no): ") {
        return Ok(());
    }

    match recipient {
        Identity::Address(_) => {
            market_instance
                .methods()
                .withdraw_reserves(recipient, args.amount)
                .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?;
        }
        Identity::ContractId(id) => {
            market_instance
                .methods()
                .withdraw_reserves(recipient, args.amount)
                .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
                .with_contract_ids(&[market_contract_id.clone(), id.into()])
                .call()
                .await?;
        }
    }

    println!(
        "Balance of the recipient: {}",
        match recipient {
            Identity::Address(addr) => provider
                .get_asset_balance(&addr.into(), market_config.base_token)
                .await
                .unwrap(),
            Identity::ContractId(id) => provider
                .get_contract_asset_balance(&id.into(), market_config.base_token)
                .await
                .unwrap(),
        }
    );

    println!(
        "Reserves balance: {}",
        convert_i256_to_u64(
            &market_instance
                .methods()
                .get_reserves()
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?
                .value
        )
    );

    Ok(())
}
