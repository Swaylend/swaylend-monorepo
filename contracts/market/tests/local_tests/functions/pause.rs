use crate::utils::contracts_utils::market_utils::{
    get_market_config, MarketContract, PauseConfiguration,
};
use crate::utils::contracts_utils::token_utils::deploy_tokens;
use crate::utils::init_wallets;
use crate::utils::number_utils::parse_units;
use chrono::Utc;
use fuels::prelude::ViewOnlyAccount;
use fuels::types::{Address, Bits256, ContractId};
use pyth_mock::PythMockContract;

#[tokio::test]
async fn pause_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = &wallets[0];
    let alice = &wallets[1];
    let bob = &wallets[2];

    let alice_address = Address::from(alice.address());
    let bob_address = Address::from(bob.address());

    //--------------- ORACLE ---------------
    let oracle = PythMockContract::deploy(admin).await.unwrap();
    let oracle_contract_id = ContractId::from(oracle.instance.contract_id());

    //--------------- TOKENS ---------------
    let (assets, asset_configs, token_contract) = deploy_tokens(&admin, false).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_contract = src20_sdk::token_utils::Asset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &usdc.symbol,
    );
    let uni = assets.get("UNI").unwrap();
    let uni_contract = src20_sdk::token_utils::Asset::new(
        admin.clone(),
        token_contract.contract_id().into(),
        &uni.symbol,
    );

    //--------------- MARKET ---------------
    let fuel_eth_base_asset_id = Bits256::zeroed();

    let market_config = get_market_config(
        admin.address().into(),
        admin.address().into(),
        usdc.bits256,
        usdc.decimals as u32,
        usdc.price_feed_id,
        oracle_contract_id,
        fuel_eth_base_asset_id,
    )
    .unwrap();

    // debug step
    let debug_step: u64 = 10000;
    let market = MarketContract::deploy(&admin, market_config, debug_step, false)
        .await
        .unwrap();

    // Set Pyth contract ID
    market
        .set_pyth_contract_id(oracle_contract_id)
        .await
        .unwrap();

    // Activate contract
    market.activate_contract().await.unwrap();

    //--------------- SETUP COLLATERALS ---------------
    for config in &asset_configs {
        market.add_collateral_asset(&config).await.unwrap();
    }

    // ==================== Set oracle prices ====================
    let mut prices = Vec::new();
    let publish_time: u64 = Utc::now().timestamp().try_into().unwrap();
    let confidence = 0;

    for asset in &assets {
        let price = asset.1.default_price * 10u64.pow(asset.1.price_feed_decimals);

        prices.push((
            asset.1.price_feed_id,
            (price, asset.1.price_feed_decimals, publish_time, confidence),
        ))
    }

    oracle.update_prices(prices).await.unwrap();

    for asset in &assets {
        let price = oracle.price(asset.1.price_feed_id).await.unwrap().value;

        println!(
            "Price for {} = {}",
            asset.1.symbol,
            price.price as f64 / 10u64.pow(asset.1.price_feed_decimals as u32) as f64
        );
    }

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 400.00 USDC

    let amount = parse_units(400, usdc.decimals);

    // Transfer of 400 USDC to the Bob's wallet
    usdc_contract.mint(bob_address, amount).await.unwrap();

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    // Bob calls supply_base
    market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 400 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(bob_address).await.unwrap();

    assert!(supply_balance == (amount as u128));

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 40.00 UNI ~ $200.00

    let amount = parse_units(40, uni.decimals);

    // Transfer of 40 UNI to the Alice's wallet
    uni_contract.mint(alice_address, amount).await.unwrap();

    let balance = alice.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == amount);

    // Alice calls supply_collateral
    market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 40 UNI
    let res = market
        .get_user_collateral(alice_address, uni.bits256)
        .await
        .unwrap();
    assert!(res == amount as u128);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 150.00 USDC

    let amount = parse_units(150, usdc.decimals);

    // Alice calls withdraw_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount)
        .await
        .unwrap();

    // USDC balance check
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of collateral price
    // 💰 Amount: -10%

    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.9) as u64;
    let prices = Vec::from([(
        uni.price_feed_id,
        (
            new_price,
            uni.price_feed_decimals,
            res.publish_time,
            res.confidence,
        ),
    )]);
    oracle.update_prices(prices).await.unwrap();

    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], alice_address)
            .await
            .unwrap()
            .value
    );

    market
        .with_account(bob)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![alice_address])
        .await
        .unwrap();

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(alice_address).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(alice_address, uni.bits256)
        .await
        .unwrap();
    assert!(amount == 0);

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: 172.44 USDC

    let reserves = market
        .with_account(bob)
        .await
        .unwrap()
        .get_collateral_reserves(uni.bits256)
        .await
        .unwrap()
        .value;
    assert!(!reserves.negative);

    let amount = market
        .collateral_value_to_sell(
            &[&oracle.instance],
            uni.bits256,
            reserves.value.try_into().unwrap(),
        )
        .await
        .unwrap();

    // Transfer of amount to the wallet
    usdc_contract
        .mint(bob_address, amount.try_into().unwrap())
        .await
        .unwrap();

    // Сheck balance
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount as u64);

    // Bob calls buy_collateral
    market
        .with_account(bob)
        .await
        .unwrap()
        .buy_collateral(
            &[&oracle.instance],
            usdc.asset_id,
            amount as u64,
            uni.bits256,
            1,
            bob_address,
        )
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();

    // TODO claim_paused

    // =================================================
    // ==================== Step #6 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Call: reset UNI price and pause

    let price = oracle.price(uni.price_feed_id).await.unwrap().value;
    let amount = parse_units(5, uni.price_feed_decimals.into()); // 1 UNI = $5
    oracle
        .update_prices(Vec::from([(
            uni.price_feed_id,
            (
                amount,
                uni.price_feed_decimals,
                price.publish_time,
                price.confidence,
            ),
        )]))
        .await
        .unwrap();
    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    assert!(res.price == amount);

    let pause_config = PauseConfiguration {
        supply_paused: true,
        withdraw_paused: true,
        absorb_paused: true,
        buy_paused: true,
    };

    // Expect error because of GOVERNOR check
    assert!(market
        .with_account(alice)
        .await
        .unwrap()
        .pause(&pause_config)
        .await
        .is_err());

    market
        .with_account(admin)
        .await
        .unwrap()
        .pause(&pause_config)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #7 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 400.00 USDC

    let amount = parse_units(400, usdc.decimals);

    // Transfer of 400 USDC to the Bob's wallet
    usdc_contract.mint(bob_address, amount).await.unwrap();

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    // Bob calls supply_base
    let res = market
        .with_account(bob)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #8 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 40.00 UNI ~ $200.00

    let amount = parse_units(40, uni.decimals);

    // Transfer of 40 UNI to the Alice's wallet
    uni_contract.mint(alice_address, amount).await.unwrap();

    let balance = alice.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == amount);

    // Alice calls supply_collateral
    let res = market
        .with_account(alice)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, amount)
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #9 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 150.00 USDC

    let amount = parse_units(150, usdc.decimals);

    // Alice calls withdraw_base

    let res = market
        .with_account(alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount)
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    let res = market
        .with_account(bob)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![alice_address])
        .await
        .is_err();
    assert!(res);

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: 172.44 USDC

    let reserves = market
        .with_account(bob)
        .await
        .unwrap()
        .get_collateral_reserves(uni.bits256)
        .await
        .unwrap()
        .value;
    assert!(!reserves.negative);

    let amount = market
        .collateral_value_to_sell(
            &[&oracle.instance],
            uni.bits256,
            reserves.value.try_into().unwrap(),
        )
        .await
        .unwrap();

    // Bob calls buy_collateral
    let res = market
        .with_account(bob)
        .await
        .unwrap()
        .buy_collateral(
            &[&oracle.instance],
            usdc.asset_id,
            amount as u64,
            uni.bits256,
            1,
            bob_address,
        )
        .await
        .is_err();
    assert!(res);
}
