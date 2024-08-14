use dotenv::dotenv;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    macros::abigen,
    programs::contract::{Contract, LoadConfiguration},
    types::{transaction::TxPolicies, transaction_builders::VariableOutputPolicy, AssetId},
};
use rand::Rng;
use std::{error::Error, path::PathBuf};

abigen!(Contract(
    name = "Token",
    abi = "contracts/src-20/out/release/src-20-abi.json",
));

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    // setup fuel provider
    let rpc = std::env::var("RPC").unwrap();
    let provider = Provider::connect(rpc).await.unwrap();

    // setup wallet
    let secret = std::env::var("SECRET").unwrap();
    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    // deploy token
    let configurables = TokenConfigurables::default();
    let root = PathBuf::from(env!("CARGO_WORKSPACE_DIR"));
    let bin_path = root.join("contracts/src-20/out/release/src-20.bin");
    let config = LoadConfiguration::default().with_configurables(configurables);

    let mut rng = rand::thread_rng();
    let salt = rng.gen::<[u8; 32]>();

    let id = Contract::load_from(bin_path, config)?
        .with_salt(salt)
        .deploy(&wallet, TxPolicies::default())
        .await?;
    let instance = Token::new(id.clone(), wallet.clone());
    instance
        .methods()
        .constructor(wallet.address().into())
        .call()
        .await?;

    println!("Token deployed at: 0x{}", instance.contract_id().hash());

    let asset_id = instance.methods().asset_id().simulate().await?.value;
    println!("Asset id: 0x{}", asset_id);

    // mint the whole supply to the deployer
    let sub_id = AssetId::default();

    let max_supply = instance
        .methods()
        .max_supply(asset_id)
        .simulate()
        .await?
        .value
        .unwrap();

    instance
        .methods()
        .mint(wallet.address().into(), sub_id.into(), max_supply)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
        .call()
        .await?;

    println!("Minted {} tokens to {}", max_supply, wallet.address());

    Ok(())
}
