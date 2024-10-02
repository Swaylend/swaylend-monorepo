mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
};
use pyth_mock_sdk::PythMockContract;
use std::str::FromStr;
use utils::{read_env, verify_connected_network, Args};

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
    let wallet = WalletUnlocked::new_from_private_key(secret, Some(provider));

    let pyth_contract = PythMockContract::deploy(&wallet).await.unwrap();

    println!(
        "Pyth mock contract deployed at: 0x{}",
        pyth_contract.contract_id().hash
    );

    Ok(())
}
