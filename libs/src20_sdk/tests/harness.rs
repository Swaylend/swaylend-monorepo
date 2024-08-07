use fuels::{
    prelude::ViewOnlyAccount,
    test_helpers::{launch_custom_provider_and_get_wallets, WalletsConfig},
};
use src20_sdk::token_utils::{deploy_token_contract, Asset};

#[tokio::test]
async fn main_test() {
    let wallets_config = WalletsConfig::new(Some(5), Some(1), Some(1_000_000_000));
    let wallets = launch_custom_provider_and_get_wallets(wallets_config, None, None)
        .await
        .unwrap();
    let admin = &wallets[0];
    let alice = &wallets[1];

    let token_contarct = deploy_token_contract(&admin).await;
    let usdc = Asset::new(admin.clone(), token_contarct.contract_id().into(), "USDC");

    usdc.mint(alice.address().into(), usdc.parse_units(1000.0) as u64)
        .await
        .unwrap();

    assert_eq!(
        alice.get_asset_balance(&usdc.asset_id).await.unwrap(),
        usdc.parse_units(1000.0) as u64
    )
}
