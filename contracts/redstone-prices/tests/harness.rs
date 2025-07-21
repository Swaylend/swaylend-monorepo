use fuels::{
    test_helpers::{launch_custom_provider_and_get_wallets, NodeConfig, Trigger, WalletsConfig},
    types::{Bits256, Bytes, U256},
};
use redstone_prices_sdk::RedstonePricesContract;

#[tokio::test]
async fn update_price_reverts() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    redstone
        .activate(
            3,
            vec![
                Bits256::from_hex_str(
                    "0x00000000000000000000000012470f7aba85c8b81d63137dd5925d6ee114952b",
                )
                .unwrap(),
                Bits256::from_hex_str(
                    "0x000000000000000000000000109B4a318A4F5ddcbCA6349B45f881B4137deaFB",
                )
                .unwrap(),
                Bits256::from_hex_str(
                    "0x0000000000000000000000001ea62d73edf8ac05dfcea1a34b9796e937a29eff",
                )
                .unwrap(),
                Bits256::from_hex_str(
                    "0x0000000000000000000000002c59617248994D12816EE1Fa77CE0a64eEB456BF",
                )
                .unwrap(),
                Bits256::from_hex_str(
                    "0x00000000000000000000000083cba8c619fb629b81a65c2e67fe15cf3e3c9747",
                )
                .unwrap(),
                Bits256::from_hex_str(
                    "0x000000000000000000000000f786a909d559f5dee2dc6706d8e5a81728a39ae9",
                )
                .unwrap(),
            ],
            owner.address().into(),
        )
        .await
        .unwrap();

    let price_feed_ids = vec![
        U256::from_dec_str("4346947").unwrap(), // BTC
        U256::from_dec_str("4543560").unwrap(), // ETH
    ];

    let payload = Bytes::from_hex_str("45544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004f9ad079100190bb63fa9000000020000001d1709463ef2a6a1e5385343e81d21f89bce3250fb3c8475d1cb1281f035b3ebf589869d1652171dffabc9add37650a7568d7d8bd6ee508a1fd78d680e66510701b45544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004f9ad079100190bb63fa9000000020000001955f98a2b66f27fe094578641b23a00273026d071295069c36bff781a5a3df75760810a6eb97a38601b5b1b8407c8b452390003cfee77d8c84b765fa032a414b1c45544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004f9ad079100190bb63fa9000000020000001a5dd9ad3ece9896337982a72d4e14f8ed166f46efa07af002e1c8063352cd6d15dbd4a797b66e7ce64b5742bddb843247d94189d5a29c17e4791e2f5d47a11fa1c4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005cb89e535800190bb63fa900000002000000114f414678e0e8b20e5304a98f068f14a9136f67294ec369fd9f5a2e814480b0f1dbdc374eaf88b581cf6591c16d27a790e6b95ebfe60268153441d46cde0a7701b4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005cb89e535800190bb63fa9000000020000001eed4c34a625ca3b3535cfac407fb98c679173eaa5ca3ffff15e3a062b71c991539f064a6bb47e83f7e1bc7501dd1f515a9c3a5c981acafe86a22526c2682606d1c4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005cb89e535800190bb63fa900000002000000169cf46859df891e25c27c0a7533233f740ae82efc656cab9b40d7ee268805db8034fd08aef041e166577ce40f79d92cdf541e21a2427106807f29cb6c696e3081b0006000000000002ed57011e0000").unwrap();

    let result = redstone
        .update_prices(price_feed_ids.clone(), payload)
        .await
        .unwrap_err();

    assert!(result.to_string().contains("TimestampOutOfRange"));
}

#[tokio::test]
async fn get_version() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    let version_response = redstone.get_version().await.unwrap();

    assert_eq!(version_response.value, 1);
}

#[tokio::test]
async fn activate() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    redstone
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap();

    // Should revert if trying to activate again
    let result = redstone
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap_err();

    assert!(result.to_string().contains("CannotReinitialized"));
}

#[tokio::test]
async fn set_signer_count_threshold() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    redstone
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap();

    let signer_count_threshold_response = redstone.get_signer_count_threshold().await.unwrap();
    assert_eq!(signer_count_threshold_response.value, 1);

    redstone.set_signer_count_threshold(2).await.unwrap();

    let signer_count_threshold_response = redstone.get_signer_count_threshold().await.unwrap();
    assert_eq!(signer_count_threshold_response.value, 2);
}

#[tokio::test]
async fn set_allowed_signers() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    redstone
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap();

    let allowed_signers_response = redstone.get_allowed_signers().await.unwrap();
    assert_eq!(allowed_signers_response.value, vec![]);

    let signer =
        Bits256::from_hex_str("0x00000000000000000000000012470f7aba85c8b81d63137dd5925d6ee114952b")
            .unwrap();

    redstone.set_allowed_signers(vec![signer]).await.unwrap();

    let allowed_signers_response = redstone.get_allowed_signers().await.unwrap();
    assert_eq!(allowed_signers_response.value, vec![signer]);
}

#[tokio::test]
async fn add_and_remove_allowed_signer() {
    let wallets_config = WalletsConfig::new(Some(1), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    redstone
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap();

    let allowed_signers_response = redstone.get_allowed_signers().await.unwrap();
    assert_eq!(allowed_signers_response.value, vec![]);

    // Add signer
    let signer =
        Bits256::from_hex_str("0x00000000000000000000000012470f7aba85c8b81d63137dd5925d6ee114952b")
            .unwrap();

    redstone.add_allowed_signer(signer).await.unwrap();

    let allowed_signers_response = redstone.get_allowed_signers().await.unwrap();
    assert_eq!(allowed_signers_response.value, vec![signer]);

    // Add signer that already exists
    let result = redstone.add_allowed_signer(signer).await.unwrap_err();
    assert!(result.to_string().contains("SignerAlreadyInList"));

    // Add another signer
    let signer2 =
        Bits256::from_hex_str("0x000000000000000000000000109B4a318A4F5ddcbCA6349B45f881B4137deaFB")
            .unwrap();
    redstone.add_allowed_signer(signer2).await.unwrap();

    let allowed_signers_response = redstone.get_allowed_signers().await.unwrap();
    assert_eq!(allowed_signers_response.value, vec![signer, signer2]);

    // Remove signer
    redstone.remove_allowed_signer(signer).await.unwrap();

    let allowed_signers_response = redstone.get_allowed_signers().await.unwrap();
    assert_eq!(allowed_signers_response.value, vec![signer2]);

    // Remove signer that doesn't exist
    let result = redstone.remove_allowed_signer(signer).await.unwrap_err();
    assert!(result.to_string().contains("SignerNotInList"));
}

#[tokio::test]
async fn check_only_owner_methods_revert() {
    let wallets_config = WalletsConfig::new(Some(2), Some(1), Some(1_000_000_000));

    let provider_config = NodeConfig {
        block_production: Trigger::Instant,
        ..NodeConfig::default()
    };

    let wallets =
        launch_custom_provider_and_get_wallets(wallets_config, Some(provider_config), None)
            .await
            .unwrap();

    let owner = wallets.get(0).unwrap();
    let bob = wallets.get(1).unwrap();

    let redstone = RedstonePricesContract::deploy(owner).await.unwrap();
    redstone
        .activate(1, vec![], owner.address().into())
        .await
        .unwrap();

    let redstone_bob = redstone.with_account(bob).await.unwrap();

    // Set signer count threshold
    let result = redstone_bob
        .set_signer_count_threshold(2)
        .await
        .unwrap_err();
    assert!(result.to_string().contains("NotOwner"));

    let signer =
        Bits256::from_hex_str("0x00000000000000000000000012470f7aba85c8b81d63137dd5925d6ee114952b")
            .unwrap();

    // Add allowed signer
    let result = redstone_bob.add_allowed_signer(signer).await.unwrap_err();
    assert!(result.to_string().contains("NotOwner"));

    // Remove allowed signer
    let result = redstone_bob
        .remove_allowed_signer(signer)
        .await
        .unwrap_err();
    assert!(result.to_string().contains("NotOwner"));

    // Set allowed signers
    let result = redstone_bob
        .set_allowed_signers(vec![signer])
        .await
        .unwrap_err();
    assert!(result.to_string().contains("NotOwner"));
}
