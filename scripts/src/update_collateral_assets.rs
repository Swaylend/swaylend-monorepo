mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::AssetId,
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
    println!("UPDATE COLLATERAL ASSETS");

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

    // verify explicitly assets decimals
    for collateral_asset in &market_config.collateral_assets {
        assert!(collateral_asset.decimals >= market_config.base_asset.decimals);
    }

    // get current collateral assets configurations
    let collateral_asset_configurations = market_instance
        .methods()
        .get_collateral_configurations()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;

    // iterater over collateral assets configurations in the market config file
    // if the collateral asset is already added, check if all properties are the same
    // otherwise, add the collateral asset
    for collateral_asset_config in market_config.collateral_assets {
        let asset_id = collateral_asset_config.clone().asset_id;
        let asset_config = collateral_asset_configurations
            .iter()
            .find(|config| config.asset_id == AssetId::from_str(asset_id.as_str()).unwrap());

        match asset_config {
            Some(asset_config) => {
                if asset_config != &collateral_asset_config {
                    println!(
                        "Updating collateral asset configuration for asset_id: {}",
                        asset_id
                    );
                    println!("Old collateral asset configuration: {:#?}", asset_config);
                    println!(
                        "New collateral asset configuration: {:#?}",
                        collateral_asset_config
                    );
                    if !get_yes_no_input(
                        "Do you really want to update this collateral asset? (yes/no): ",
                    ) {
                        continue;
                    }

                    market_instance
                        .methods()
                        .update_collateral_asset(
                            AssetId::from_str(asset_id.as_str()).unwrap(),
                            collateral_asset_config.into(),
                        )
                        .with_contract_ids(&[market_contract_id.clone()])
                        .call()
                        .await?;
                } else {
                    println!(
                        "Collateral asset configuration for asset_id: {} is already up-to-date",
                        asset_id
                    );
                }
            }
            None => {
                println!(
                    "Adding collateral asset configuration for asset_id: {}",
                    asset_id
                );
                println!(
                    "Collateral asset configuration: {:#?}",
                    collateral_asset_config
                );
                if !get_yes_no_input("Do you really want to add this collateral asset? (yes/no): ")
                {
                    continue;
                }
                market_instance
                    .methods()
                    .add_collateral_asset(collateral_asset_config.into())
                    .with_contract_ids(&[market_contract_id.clone()])
                    .call()
                    .await?;
            }
        }
    }

    // read values to see if they are set correctly
    let collateral_asset_configurations = market_instance
        .methods()
        .get_collateral_configurations()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;
    println!(
        "Collateral assets configurations: {:#?}",
        collateral_asset_configurations
    );

    println!("Collateral assets updated successfully");

    Ok(())
}
