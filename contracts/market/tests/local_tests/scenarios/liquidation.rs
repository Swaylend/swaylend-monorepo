use crate::utils::{print_case_title, setup, TestData};
use chrono::Utc;
use fuels::{
    accounts::ViewOnlyAccount,
    programs::{
        calls::{CallHandler, CallParameters},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, transaction_builders::VariableOutputPolicy},
};
use market::PriceDataUpdate;
use market_sdk::{convert_i256_to_i128, parse_units};

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn absorb_and_liquidate() {
    let TestData {
        wallets,
        alice,
        alice_address,
        bob,
        bob_address,
        chad,
        market,
        assets,
        usdc,
        eth,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        usdc_contract,
        ..
    } = setup().await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 3000.00 USDC
    let alice_supply_amount = parse_units(3000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(4000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_supply_log_amount = format!("{} USDC", alice_supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", alice_supply_log_amount.as_str());
    println!("💸 Alice + {alice_supply_log_amount}");
    usdc_contract
        .mint(alice_address, alice_mint_amount)
        .await
        .unwrap();
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == alice_mint_amount);

    let alice_supply_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, alice_supply_amount)
        .await;
    assert!(alice_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_collateral
    // 💰 Amount: 1.00 ETH
    let bob_supply_amount = parse_units(1 * AMOUNT_COEFFICIENT, eth.decimals);
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    let bob_user_collateral = market
        .get_user_collateral(bob_address, eth.bits256)
        .await
        .unwrap();
    assert!(bob_user_collateral == bob_supply_amount as u128);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: <MAX HE CAN BORROW>
    let max_borrow_amount = market
        .available_to_borrow(&[&oracle.instance], bob_address)
        .await
        .unwrap();
    let log_amount = format!("{} USDC", max_borrow_amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount.as_str());
    let bob_borrow_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            max_borrow_amount.try_into().unwrap(),
            &price_data_update,
        )
        .await;
    assert!(bob_borrow_res.is_ok());

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == max_borrow_amount as u64);
    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of ETH price
    // 💰 Amount: -50%
    print_case_title(3, "Admin", "Drop of ETH price", "-50%");
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.5) as u64;
    let prices = Vec::from([(
        eth.price_feed_id,
        (
            new_price,
            eth.price_feed_decimals,
            res.publish_time,
            res.confidence,
        ),
    )]);

    oracle.update_prices(&prices).await.unwrap();

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids: vec![eth.price_feed_id],
        publish_times: vec![Utc::now().timestamp().try_into().unwrap()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    println!(
        "🔻 ETH price drops: ${}  -> ${}",
        res.price as f64 / 10_u64.pow(eth.price_feed_decimals) as f64,
        new_price as f64 / 10_u64.pow(eth.price_feed_decimals) as f64
    );
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: absorb
    // 🔥 Target: Bob
    print_case_title(4, "Chad", "absorb", "Bob");

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], bob_address)
            .await
            .unwrap()
            .value
    );

    let chad_absorb_bob_res = market
        .with_account(&chad)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![bob_address], &price_data_update)
        .await;
    assert!(chad_absorb_bob_res.is_ok());

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(bob_address).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(bob_address, eth.bits256)
        .await
        .unwrap();
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: buy_collateral
    // 💰 Amount: <MAX HE CAN BUY>
    let reserves = market
        .with_account(&alice)
        .await
        .unwrap()
        .get_collateral_reserves(eth.bits256)
        .await
        .unwrap()
        .value;
    assert!(!reserves.negative);

    let amount = market
        .collateral_value_to_sell(
            &[&oracle.instance],
            eth.bits256,
            reserves.value.try_into().unwrap(),
        )
        .await
        .unwrap();

    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(5, "Alice", "buy_collateral", log_amount.as_str());

    // Prepare calls for multi_call_handler
    let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);

    // Params for update_price_feeds_if_necessary
    let call_params_update_price =
        CallParameters::default().with_amount(price_data_update.update_fee);

    // Update price feeds if necessary
    let update_balance_call = market
        .instance
        .methods()
        .update_price_feeds_if_necessary(price_data_update.clone())
        .with_contracts(&[&oracle.instance])
        .with_tx_policies(tx_policies)
        .call_params(call_params_update_price)
        .unwrap();

    // Params for buy_collateral
    let call_params_base_asset = CallParameters::default()
        .with_amount(amount as u64)
        .with_asset_id(usdc.asset_id);

    // Buy collateral with base asset
    usdc_contract
        .mint(alice_address, amount.try_into().unwrap())
        .await
        .unwrap();

    let buy_collateral_call = market
        .instance
        .methods()
        .buy_collateral(eth.bits256, 1u64.into(), alice_address)
        .with_contracts(&[&oracle.instance])
        .with_tx_policies(tx_policies)
        .call_params(call_params_base_asset)
        .unwrap();

    let mutli_call_handler = CallHandler::new_multi_call(alice.clone())
        .add_call(update_balance_call)
        .add_call(buy_collateral_call)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Sumbit tx
    let submitted_tx = mutli_call_handler.submit().await.unwrap();

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();
    let alice_balance = alice.get_asset_balance(&eth.asset_id).await.unwrap();
    assert!(alice_balance == 10_999_999_996 * AMOUNT_COEFFICIENT);

    // check reserves
    let reserves = market
        .with_account(&alice)
        .await
        .unwrap()
        .get_collateral_reserves(eth.bits256)
        .await
        .unwrap()
        .value;
    let normalized_reserves: u64 = convert_i256_to_i128(reserves).try_into().unwrap();
    assert!(normalized_reserves == 0);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}

#[tokio::test]
async fn all_assets_liquidated() {
    let TestData {
        wallets,
        alice,
        alice_address,
        bob,
        bob_address,
        chad,
        market,
        assets,
        usdc,
        eth,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        usdc_contract,
        ..
    } = setup().await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 3000.00 USDC
    let alice_supply_amount = parse_units(3000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(20000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_supply_log_amount = format!("{} USDC", alice_supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", alice_supply_log_amount.as_str());
    println!("💸 Alice + {alice_supply_log_amount}");
    usdc_contract
        .mint(alice_address, alice_mint_amount)
        .await
        .unwrap();
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == alice_mint_amount);

    let alice_supply_res = market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, alice_supply_amount)
        .await;
    assert!(alice_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_collateral
    // 💰 Amount: 1.00 ETH
    let bob_supply_amount = parse_units(1 * AMOUNT_COEFFICIENT, eth.decimals);
    let bob_mint_log_amount = format!("{} ETH", bob_supply_amount as f64 / SCALE_9);
    print_case_title(1, "Bob", "supply_collateral", bob_mint_log_amount.as_str());
    println!("💸 Bob + {bob_mint_log_amount}");
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    let bob_user_collateral = market
        .get_user_collateral(bob_address, eth.bits256)
        .await
        .unwrap();
    assert!(bob_user_collateral == bob_supply_amount as u128);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    market.debug_increment_timestamp().await.unwrap();
    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: <MAX HE CAN BORROW>
    let max_borrow_amount = market
        .available_to_borrow(&[&oracle.instance], bob_address)
        .await
        .unwrap();
    println!("Bob can borrow {max_borrow_amount} USDC");
    let log_amount = format!("{} USDC", max_borrow_amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount.as_str());
    let bob_withdraw_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            max_borrow_amount.try_into().unwrap(),
            &price_data_update,
        )
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == max_borrow_amount as u64);
    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of ETH price
    // 💰 Amount: -50%
    print_case_title(3, "Admin", "Drop of ETH price", "-50%");
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.5) as u64;
    let prices = Vec::from([(
        eth.price_feed_id,
        (
            new_price,
            eth.price_feed_decimals,
            res.publish_time,
            res.confidence,
        ),
    )]);

    oracle.update_prices(&prices).await.unwrap();

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids: vec![eth.price_feed_id],
        publish_times: vec![Utc::now().timestamp().try_into().unwrap()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    println!(
        "🔻 ETH price drops: ${}  -> ${}",
        res.price as f64 / 10_u64.pow(eth.price_feed_decimals) as f64,
        new_price as f64 / 10_u64.pow(eth.price_feed_decimals) as f64
    );
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: absorb
    // 🔥 Target: Bob
    print_case_title(4, "Chad", "absorb", "Bob");

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], bob_address)
            .await
            .unwrap()
            .value
    );

    let chad_absorb_bob_res = market
        .with_account(&chad)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![bob_address], &price_data_update)
        .await;
    assert!(chad_absorb_bob_res.is_ok());

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(bob_address).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(bob_address, eth.bits256)
        .await
        .unwrap();
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: buy_collateral
    // 💰 Amount: <MAX HE CAN BUY>
    let reserves = market
        .with_account(&alice)
        .await
        .unwrap()
        .get_collateral_reserves(eth.bits256)
        .await
        .unwrap()
        .value;
    assert!(!reserves.negative);

    let amount = market
        .collateral_value_to_sell(
            &[&oracle.instance],
            eth.bits256,
            reserves.value.try_into().unwrap(),
        )
        .await
        .unwrap();

    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(5, "Alice", "buy_collateral", log_amount.as_str());

    // Prepare calls for multi_call_handler
    let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);

    // Params for update_price_feeds_if_necessary
    let call_params_update_price =
        CallParameters::default().with_amount(price_data_update.update_fee);

    // Update price feeds if necessary
    let update_balance_call = market
        .instance
        .methods()
        .update_price_feeds_if_necessary(price_data_update.clone())
        .with_contracts(&[&oracle.instance])
        .with_tx_policies(tx_policies)
        .call_params(call_params_update_price)
        .unwrap();

    // Params for buy_collateral
    let call_params_base_asset = CallParameters::default()
        .with_amount(amount as u64)
        .with_asset_id(usdc.asset_id);

    // Buy collateral with base asset
    let buy_collateral_call = market
        .instance
        .methods()
        .buy_collateral(eth.bits256, 1u64.into(), alice_address)
        .with_contracts(&[&oracle.instance])
        .with_tx_policies(tx_policies)
        .call_params(call_params_base_asset)
        .unwrap();

    let mutli_call_handler = CallHandler::new_multi_call(alice.clone())
        .add_call(update_balance_call)
        .add_call(buy_collateral_call)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Sumbit tx
    let submitted_tx = mutli_call_handler.submit().await.unwrap();

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    // Check asset balance
    let balance = alice.get_asset_balance(&eth.asset_id).await.unwrap();
    assert!(balance == 10_999_999_997 * AMOUNT_COEFFICIENT);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
