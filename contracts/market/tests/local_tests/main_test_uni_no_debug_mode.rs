use crate::utils::{init_wallets, print_case_title};
use chrono::Utc;
use fuels::prelude::ViewOnlyAccount;
use fuels::types::{Address, Bits256, ContractId};
use market_sdk::{get_market_config, parse_units, MarketContract};
use pyth_mock_sdk::PythMockContract;
use token_sdk::deploy_tokens;

// Multiplies all values by this number
// It is necessary in order to test how the protocol works with large amounts
const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);

#[tokio::test]
async fn main_test_no_debug() {
    let scale_6 = 10u64.pow(6) as f64;
    let scale_9 = 10u64.pow(9) as f64;

    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = &wallets[0];
    let alice = &wallets[1];
    let bob = &wallets[2];
    let chad = &wallets[3];

    let alice_address = Address::from(alice.address());
    let bob_address = Address::from(bob.address());
    let chad_address = Address::from(chad.address());

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
        fuel_eth_base_asset_id,
    )
    .unwrap();

    let market = MarketContract::deploy(&admin, market_config, 0, false)
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
    // 💰 Amount: 100.00 USDC

    let amount = parse_units(100 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(0, "Bob", "supply_base", log_amount.as_str());
    println!("💸 Bob + {log_amount}");

    // Transfer of 100 USDC to the Bob's wallet
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

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 40.00 UNI ~ $200.00

    let amount = parse_units(40 * AMOUNT_COEFFICIENT, uni.decimals);
    let log_amount = format!("{} UNI", amount as f64 / scale_9);
    print_case_title(1, "Alice", "supply_collateral", log_amount.as_str());
    println!("💸 Alice + {log_amount}");

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

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 50.00 USDC

    let amount = parse_units(50 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(2, "Alice", "withdraw_base", log_amount.as_str());

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

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: supply_collateral
    // 💰 Amount: 60.00 UNI ~ $300.00

    let amount = parse_units(60 * AMOUNT_COEFFICIENT, uni.decimals);
    let log_amount = format!("{} UNI", amount as f64 / scale_9);
    print_case_title(3, "Chad", "supply_collateral", log_amount.as_str());
    println!("💸 Chad + {log_amount}");

    // Transfer of 60 UNI to the Chad's wallet
    uni_contract.mint(chad_address, amount).await.unwrap();

    let balance = chad.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == amount);

    // Chad calls supply_collateral
    market
        .with_account(&chad)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 60 UNI
    let res = market
        .get_user_collateral(chad_address, uni.bits256)
        .await
        .unwrap();
    assert!(res == amount as u128);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: supply_base
    // 💰 Amount: 200.00 USDC

    let amount = parse_units(200 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(4, "Chad", "supply_base", log_amount.as_str());
    println!("💸 Chad + {log_amount}");

    // Transfer of 200 USDC to the Chad's wallet
    usdc_contract.mint(chad_address, amount).await.unwrap();

    let balance = chad.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    // Chad calls supply_base
    market
        .with_account(&chad)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 200 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(chad_address).await.unwrap();
    assert!((amount as u128) - 5 < supply_balance);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: ~99.96 USDC (available_to_borrow)
    let amount = market
        .available_to_borrow(&[&oracle.instance], alice_address)
        .await
        .unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(5, "Alice", "withdraw_base", log_amount.as_str());

    // Alice calls withdraw_base
    market
        .with_account(alice)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            (amount - u128::from(parse_units(1, usdc.decimals)))
                .try_into()
                .unwrap(),
        )
        .await
        .unwrap();

    // available_to_borrow should be 1 USDC
    let res = market
        .available_to_borrow(&[&oracle.instance], alice_address)
        .await
        .unwrap();
    assert!(res == u128::from(parse_units(1, usdc.decimals)));

    // Withdrawing more than available should fail (2 USDC)
    let res = market
        .with_account(alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], parse_units(2, usdc.decimals))
        .await
        .is_err();
    assert!(res);

    // USDC balance should be amount - 1 USDC + 50 USDC from case #2
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(
        balance
            == (amount as u64) - parse_units(1, usdc.decimals)
                + parse_units(50 * AMOUNT_COEFFICIENT, usdc.decimals)
    );

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #6 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of collateral price
    // 💰 Amount: -10%

    print_case_title(6, "Admin", "Drop of collateral price", "-10%");
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

    println!(
        "🔻 UNI price drops: ${}  -> ${}",
        res.price as f64 / 10_u64.pow(uni.price_feed_decimals) as f64,
        new_price as f64 / 10_u64.pow(uni.price_feed_decimals) as f64
    );
    let res = oracle.price(uni.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();
    // =================================================
    // ==================== Step #7 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    print_case_title(7, "Bob", "absorb", "Alice");

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

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #8 ====================
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

    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(8, "Bob", "buy_collateral", log_amount.as_str());

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

    // Check asset balance
    let balance = bob.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == 40_000_000_000 * AMOUNT_COEFFICIENT);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #9 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 100.021671 USDC

    let (amount, _) = market.get_user_supply_borrow(bob_address).await.unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(9, "Bob", "withdraw_base", log_amount.as_str());

    // Bob calls withdraw_base
    market
        .with_account(bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount.try_into().unwrap())
        .await
        .unwrap();

    // Check supplied is 0
    let (supplied, _) = market.get_user_supply_borrow(bob_address).await.unwrap();
    assert!(supplied == 0);

    // USDC balance check
    assert!(bob.get_asset_balance(&usdc.asset_id).await.unwrap() == amount as u64);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #10 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 200.0233392 USDC

    let (amount, _) = market.get_user_supply_borrow(chad_address).await.unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(10, "Chad", "withdraw_base", log_amount.as_str());

    // Chad calls withdraw_base
    market
        .with_account(chad)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount.try_into().unwrap())
        .await
        .unwrap();

    // Check supplied is 0
    let (supplied, _) = market.get_user_supply_borrow(chad_address).await.unwrap();
    assert!(supplied == 0);

    // USDC balance check
    assert!(chad.get_asset_balance(&usdc.asset_id).await.unwrap() == amount as u64);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #11 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 17.276598 USDC

    let (amount, _) = market.get_user_supply_borrow(alice_address).await.unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(11, "Alice", "withdraw_base", log_amount.as_str());

    // Alice calls withdraw_base
    market
        .with_account(alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount.try_into().unwrap())
        .await
        .unwrap();

    // USDC balance check
    let (supplied, _) = market.get_user_supply_borrow(alice_address).await.unwrap();
    assert!(supplied == 0);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();

    // =================================================
    // ==================== Step #12 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 270 UNI

    let amount = market
        .get_user_collateral(chad_address, uni.bits256)
        .await
        .unwrap();
    let log_amount = format!("{} UNI", amount as f64 / scale_9);
    print_case_title(12, "Chad", "withdraw_collateral", log_amount.as_str());

    // Chad calls withdraw_collateral
    market
        .with_account(chad)
        .await
        .unwrap()
        .withdraw_collateral(&[&oracle.instance], uni.bits256, amount.try_into().unwrap())
        .await
        .unwrap();

    // UNI balance check
    let balance = chad.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance as u128 == amount);

    market.print_debug_state(&wallets, usdc, uni).await.unwrap();
}
