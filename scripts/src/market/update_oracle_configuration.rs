use clap::Parser;
use fuels::{
    accounts::{provider::Provider, signers::private_key::PrivateKeySigner, wallet::Wallet},
    crypto::SecretKey,
    types::{AssetId, ContractId},
};
use market::{OracleAssetConfiguration, OracleGlobalConfiguration};
use std::str::FromStr;
use swaylend_scripts::utils::market::{
    get_market_instance, get_oracle_type, get_price_feed_id, read_market_config, Args,
};
use swaylend_scripts::utils::shared::{get_yes_no_input, read_env, verify_connected_network};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[arg(long, required = true)]
    pub config_path: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("UPDATE ORACLE CONFIGURATION");

    read_env();

    let args = ArgsExtended::parse();

    let provider = Provider::connect(&args.args.provider_url).await.unwrap();

    if !verify_connected_network(&provider, args.args.network).await? {
        eprintln!("Connected to the wrong network!");
        return Ok(());
    }

    let secret = SecretKey::from_str(&args.args.signing_key).unwrap();
    let wallet = Wallet::new(PrivateKeySigner::new(secret), provider.clone());

    let (market_instance, market_contract_id) = get_market_instance(
        &wallet,
        args.args.market_proxy_contract_id,
        args.args.market_target_contract_id,
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

    // Global oracle configurations
    let global_oracle_configurations = market_instance
        .methods()
        .get_oracle_global_configurations()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;

    // Iterate over global oracle configurations in the market config file
    // Add new global oracle configuration if it is not already added
    // Update existing global oracle configuration if it is already added
    for global_oracle_configuration in market_config.global_oracle_configurations {
        let oracle_configuration =
            global_oracle_configurations
                .iter()
                .enumerate()
                .find(|(_, config)| {
                    config.contract_id
                        == ContractId::from_str(global_oracle_configuration.contract_id.as_str())
                            .unwrap()
                });

        match oracle_configuration {
            Some((id, oracle_configuration)) => {
                if oracle_configuration != &global_oracle_configuration {
                    println!(
                        "Updating global oracle configuration for contract_id: {}",
                        global_oracle_configuration.contract_id
                    );
                    println!(
                        "Old global oracle configuration: {:#?}",
                        oracle_configuration
                    );
                    println!(
                        "New global oracle configuration: {:#?}",
                        global_oracle_configuration
                    );
                    if !get_yes_no_input(
                        "Do you really want to update this global oracle? (yes/no): ",
                    ) {
                        continue;
                    }

                    market_instance
                        .methods()
                        .update_global_oracle(
                            id as u64,
                            OracleGlobalConfiguration {
                                contract_id: ContractId::from_str(
                                    global_oracle_configuration.contract_id.as_str(),
                                )
                                .unwrap(),
                                is_disabled: !global_oracle_configuration.is_active,
                                oracle_type: get_oracle_type(
                                    global_oracle_configuration.oracle_type.as_str(),
                                ),
                            },
                        )
                        .with_contract_ids(&[market_contract_id.clone()])
                        .call()
                        .await?;
                } else {
                    println!(
                        "Global oracle configuration for contract_id: {} is already up-to-date",
                        global_oracle_configuration.contract_id
                    );
                }
            }
            None => {
                println!(
                    "Adding global oracle configuration: {:#?}",
                    global_oracle_configuration
                );

                if !get_yes_no_input("Do you really want to add this global oracle? (yes/no): ") {
                    continue;
                }

                market_instance
                    .methods()
                    .add_new_global_oracle(OracleGlobalConfiguration {
                        contract_id: ContractId::from_str(
                            global_oracle_configuration.contract_id.as_str(),
                        )
                        .unwrap(),
                        is_disabled: !global_oracle_configuration.is_active,
                        oracle_type: get_oracle_type(
                            global_oracle_configuration.oracle_type.as_str(),
                        ),
                    })
                    .with_contract_ids(&[market_contract_id.clone()])
                    .call()
                    .await?;
            }
        }
    }

    println!("Global oracle configurations updated successfully");

    // Asset oracle configurations
    let asset_oracle_configurations = market_instance
        .methods()
        .get_oracle_asset_configurations()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;

    let global_oracle_configurations = market_instance
        .methods()
        .get_oracle_global_configurations()
        .with_contract_ids(&[market_contract_id.clone()])
        .call()
        .await?
        .value;

    // Iterate over asset oracle configurations in the market config file
    // Add new asset oracle configuration if it is not already added
    // Update existing asset oracle configuration if it is already added
    for collateral_asset_config in market_config.collateral_assets {
        let asset_id = AssetId::from_str(collateral_asset_config.asset_id.as_str()).unwrap();

        let current_asset_oracle_configurations = asset_oracle_configurations
            .iter()
            .find(|config| config.0 == asset_id);

        if current_asset_oracle_configurations.is_none() {
            panic!("Asset with asset_id: {} not found", asset_id);
        }

        let current_asset_oracle_configurations =
            current_asset_oracle_configurations.unwrap().1.clone();
        let collateral_asset_config_oracle_configurations =
            collateral_asset_config.asset_oracle_configurations;

        for collateral_asset_config_oracle_configuration in
            collateral_asset_config_oracle_configurations
        {
            let oracle_configuration = current_asset_oracle_configurations.iter().find(|config| {
                config.oracle_id == collateral_asset_config_oracle_configuration.oracle_id
            });

            match oracle_configuration {
                Some(oracle_configuration) => {
                    let oracle_type = global_oracle_configurations
                        .iter()
                        .enumerate()
                        .find(|(id, _)| *id as u64 == oracle_configuration.oracle_id)
                        .unwrap()
                        .1
                        .oracle_type
                        .clone();

                    // Check if the asset oracle configuration is already up-to-date
                    if !(oracle_configuration.oracle_id
                        == collateral_asset_config_oracle_configuration.oracle_id
                        && oracle_configuration.is_disabled
                            == !collateral_asset_config_oracle_configuration.is_active
                        && oracle_configuration.price_feed_id
                            == get_price_feed_id(
                                &oracle_type,
                                collateral_asset_config_oracle_configuration
                                    .price_feed_id
                                    .as_str(),
                            ))
                    {
                        println!(
                            "Updating asset oracle configuration for asset_id: {} and oracle_id: {}",
                            asset_id,
                            collateral_asset_config_oracle_configuration.oracle_id
                        );

                        println!(
                            "Old asset oracle configuration: {:#?}",
                            oracle_configuration
                        );
                        println!(
                            "New asset oracle configuration: {:#?}",
                            collateral_asset_config_oracle_configuration
                        );

                        if !get_yes_no_input(
                            "Do you really want to update this asset oracle? (yes/no): ",
                        ) {
                            continue;
                        }

                        market_instance
                            .methods()
                            .update_asset_oracle(
                                asset_id,
                                OracleAssetConfiguration {
                                    oracle_id: collateral_asset_config_oracle_configuration
                                        .oracle_id,
                                    price_feed_id: get_price_feed_id(
                                        &oracle_type,
                                        collateral_asset_config_oracle_configuration
                                            .price_feed_id
                                            .as_str(),
                                    ),
                                    is_disabled: !collateral_asset_config_oracle_configuration
                                        .is_active,
                                },
                            )
                            .with_contract_ids(&[market_contract_id.clone()])
                            .call()
                            .await?;
                    } else {
                        println!(
                            "Asset oracle configuration for asset_id: {} and oracle_id: {} is already up-to-date",
                            asset_id,
                            collateral_asset_config_oracle_configuration.oracle_id
                        );
                    }
                }
                None => {
                    println!(
                        "Adding asset oracle configuration for asset_id: {} and oracle_id: {}",
                        asset_id, collateral_asset_config_oracle_configuration.oracle_id
                    );

                    let oracle_type = global_oracle_configurations
                        .iter()
                        .enumerate()
                        .find(|(id, _)| {
                            *id as u64 == collateral_asset_config_oracle_configuration.oracle_id
                        })
                        .unwrap()
                        .1
                        .oracle_type
                        .clone();

                    if !get_yes_no_input("Do you really want to add this asset oracle? (yes/no): ")
                    {
                        continue;
                    }

                    market_instance
                        .methods()
                        .add_new_asset_oracle(
                            asset_id,
                            OracleAssetConfiguration {
                                oracle_id: collateral_asset_config_oracle_configuration.oracle_id,
                                price_feed_id: get_price_feed_id(
                                    &oracle_type,
                                    collateral_asset_config_oracle_configuration
                                        .price_feed_id
                                        .as_str(),
                                ),
                                is_disabled: !collateral_asset_config_oracle_configuration
                                    .is_active,
                            },
                        )
                        .with_contract_ids(&[market_contract_id.clone()])
                        .call()
                        .await?;
                }
            }
        }
    }

    println!("Asset oracle configurations updated successfully");

    // Update base asset oracle configuration if it is not already up-to-date
    let base_asset_oracle_configurations = market_config.base_asset.asset_oracle_configurations;
    let asset_id = AssetId::from_str(market_config.base_asset.asset_id.as_str()).unwrap();

    let current_asset_oracle_configurations = asset_oracle_configurations
        .iter()
        .find(|config| config.0 == asset_id);

    if current_asset_oracle_configurations.is_none() {
        panic!("Base asset with asset_id: {} not found", asset_id);
    }

    let current_asset_oracle_configurations =
        current_asset_oracle_configurations.unwrap().1.clone();

    for base_asset_oracle_configuration in base_asset_oracle_configurations {
        let oracle_configuration = current_asset_oracle_configurations
            .iter()
            .find(|config| config.oracle_id == base_asset_oracle_configuration.oracle_id);

        match oracle_configuration {
            Some(oracle_configuration) => {
                let oracle_type = global_oracle_configurations
                    .iter()
                    .enumerate()
                    .find(|(id, _)| *id as u64 == oracle_configuration.oracle_id)
                    .unwrap()
                    .1
                    .oracle_type
                    .clone();

                if !(oracle_configuration.oracle_id == base_asset_oracle_configuration.oracle_id
                    && oracle_configuration.is_disabled
                        == !base_asset_oracle_configuration.is_active
                    && oracle_configuration.price_feed_id
                        == get_price_feed_id(
                            &oracle_type,
                            base_asset_oracle_configuration.price_feed_id.as_str(),
                        ))
                {
                    println!(
                        "Updating asset oracle configuration for base asset: {} and oracle_id: {}",
                        asset_id, base_asset_oracle_configuration.oracle_id
                    );

                    println!(
                        "Old asset oracle configuration: {:#?}",
                        oracle_configuration
                    );

                    println!(
                        "New asset oracle configuration: {:#?}",
                        base_asset_oracle_configuration
                    );

                    if !get_yes_no_input(
                        "Do you really want to update this asset oracle? (yes/no): ",
                    ) {
                        continue;
                    }

                    market_instance
                        .methods()
                        .update_asset_oracle(
                            asset_id,
                            OracleAssetConfiguration {
                                oracle_id: base_asset_oracle_configuration.oracle_id,
                                price_feed_id: get_price_feed_id(
                                    &oracle_type,
                                    base_asset_oracle_configuration.price_feed_id.as_str(),
                                ),
                                is_disabled: !base_asset_oracle_configuration.is_active,
                            },
                        )
                        .with_contract_ids(&[market_contract_id.clone()])
                        .call()
                        .await?;
                } else {
                    println!(
                            "Asset oracle configuration for base asset: {} and oracle_id: {} is already up-to-date",
                            asset_id, base_asset_oracle_configuration.oracle_id
                        );
                }
            }
            None => {
                println!(
                    "Adding asset oracle configuration for base asset: {} and oracle_id: {}",
                    asset_id, base_asset_oracle_configuration.oracle_id
                );

                let oracle_type = global_oracle_configurations
                    .iter()
                    .enumerate()
                    .find(|(id, _)| *id as u64 == base_asset_oracle_configuration.oracle_id)
                    .unwrap()
                    .1
                    .oracle_type
                    .clone();

                if !get_yes_no_input("Do you really want to add this asset oracle? (yes/no): ") {
                    continue;
                }

                market_instance
                    .methods()
                    .add_new_asset_oracle(
                        asset_id,
                        OracleAssetConfiguration {
                            oracle_id: base_asset_oracle_configuration.oracle_id,
                            price_feed_id: get_price_feed_id(
                                &oracle_type,
                                base_asset_oracle_configuration.price_feed_id.as_str(),
                            ),
                            is_disabled: !base_asset_oracle_configuration.is_active,
                        },
                    )
                    .with_contract_ids(&[market_contract_id.clone()])
                    .call()
                    .await?;
            }
        }
    }

    println!("Base asset oracle configurations updated successfully");

    Ok(())
}
