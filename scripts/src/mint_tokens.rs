mod utils;

use clap::Parser;
use fuels::{
    accounts::{provider::Provider, wallet::WalletUnlocked},
    crypto::SecretKey,
    types::{Address, ContractId, Identity},
};
use std::str::FromStr;
use token_sdk::{get_symbol_hash, TokenAsset, TokenContract};
use utils::{read_env, read_market_config, verify_connected_network, Args};

#[derive(Parser, Debug)]
pub struct ArgsExtended {
    #[clap(flatten)]
    pub args: Args,
    #[arg(long, required = true)]
    pub config_path: String,
    #[arg(long, required = true)]
    pub token_contract_id: String,
    #[arg(long)]
    pub recipient: Option<String>,
    #[arg(long, default_value = "100000")]
    pub amount: u64,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("MINTINIG CUSTOM TOKENS");

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

    let token_contract_id = ContractId::from_str(args.token_contract_id.as_str()).unwrap();

    let token_contract = TokenContract::new(token_contract_id, wallet).await;

    let market_config = read_market_config(&args.config_path)?;

    let mut assets = vec![];

    // base asset
    assets.push(TokenAsset {
        asset_id: token_contract
            .contract_id()
            .asset_id(&get_symbol_hash(&market_config.base_asset.symbol)),
        decimals: market_config.base_asset.decimals.into(),
        symbol: market_config.base_asset.symbol,
        instance: token_contract.instance.clone(),
    });

    // collateral assets
    for asset in market_config.collateral_assets.iter() {
        if asset.symbol == "ETH" {
            continue;
        }
        assets.push(TokenAsset {
            asset_id: token_contract
                .contract_id()
                .asset_id(&get_symbol_hash(&asset.symbol)),
            decimals: asset.decimals.into(),
            symbol: asset.clone().symbol,
            instance: token_contract.instance.clone(),
        });
    }

    for asset in assets.iter() {
        println!("{}: 0x{}", asset.symbol, asset.asset_id);
        asset.mint(recipient, args.amount).await.unwrap();
        println!("Minted {} tokens to {:?}", args.amount, args.recipient);
        println!(
            "Balance: {}",
            match recipient {
                Identity::Address(addr) => provider
                    .get_asset_balance(&addr.into(), asset.asset_id)
                    .await
                    .unwrap(),
                Identity::ContractId(id) => provider
                    .get_contract_asset_balance(&id.into(), asset.asset_id)
                    .await
                    .unwrap(),
            }
        );
    }

    Ok(())
}
