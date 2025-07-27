use clap::Parser;
use fuels::{
    accounts::{provider::Provider, signers::private_key::PrivateKeySigner, wallet::Wallet},
    crypto::SecretKey,
};
use pyth_mock_sdk::PythMockContract;
use std::str::FromStr;
use swaylend_scripts::utils::{
    market::Args,
    shared::{read_env, verify_connected_network},
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("DEPLOYING PYTH MOCK CONTRACT");

    read_env();

    let args = Args::parse();

    let provider = Provider::connect(&args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.signing_key).unwrap();
    let wallet = Wallet::new(PrivateKeySigner::new(secret), provider.clone());

    let pyth_contract = PythMockContract::deploy(&wallet).await.unwrap();

    println!(
        "Pyth mock contract deployed at: 0x{}",
        pyth_contract.contract_id()
    );

    Ok(())
}
