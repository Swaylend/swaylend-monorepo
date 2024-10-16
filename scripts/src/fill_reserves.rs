mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked, Account, ViewOnlyAccount},
    crypto::SecretKey,
    types::{bech32::Bech32ContractId, transaction::TxPolicies, ContractId, Identity},
};
use std::str::FromStr;
use utils::{
    convert_i256_to_i64, get_market_instance, get_yes_no_input, read_env, verify_connected_network,
    Args,
};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[clap(long, required = true)]
    pub amount: u64,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("FILLING RESERVES");

    read_env();

    let args = ArgsExtended::parse();

    let provider = Provider::connect(&args.args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.args.signing_key).unwrap();
    let wallet = WalletUnlocked::new_from_private_key(secret, Some(provider.clone()));

    let recipient: Identity = ContractId::from_str(&args.args.proxy_contract_id)
        .unwrap()
        .into();
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

    let address = match recipient {
        Identity::ContractId(addr) => addr,
        _ => panic!("Expected an Address"),
    };

    println!(
        "Sender balance: {:?}",
        &wallet
            .get_asset_balance(&market_config.base_token)
            .await
            .unwrap()
    );

    println!(
        "Reserves balance: {:?}",
        convert_i256_to_i64(
            &market_instance
                .methods()
                .get_reserves()
                .with_contract_ids(&[market_contract_id.clone()])
                .call()
                .await?
                .value
        )
    );

    let amount = args.amount;
    let question = &format!(
        "Do you really want to fill reserves with {}? (yes/no): ",
        amount
    );
    if !get_yes_no_input(question) {
        return Ok(());
    }

    let tx_policies = TxPolicies::default();

    wallet
        .force_transfer_to_contract(
            &Bech32ContractId::from(address),
            amount,
            market_config.base_token,
            tx_policies,
        )
        .await?;

    println!("Transfer successful!");
    println!(
        "Reserves balance: {:?}",
        convert_i256_to_i64(
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
