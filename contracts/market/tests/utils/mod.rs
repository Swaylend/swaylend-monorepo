use fuels::accounts::wallet::WalletUnlocked;
use fuels::test_helpers::{
    launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig,
};

pub mod contracts_utils;
pub mod number_utils;

pub fn print_case_title(num: u8, name: &str, call: &str, amount: &str) {
    println!(
        r#"
==================== Step #{num} ====================
👛 Wallet: {name}
🤙 Call: {call}
💰 Amount: {amount}
"#
    );
}

pub async fn init_wallets() -> Vec<WalletUnlocked> {
    let wallets_config = WalletsConfig::new(Some(5), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
        .await
        .unwrap()
}
