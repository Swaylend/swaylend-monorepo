use crate::utils::{print_case_title, setup, TestData};
use chrono::Utc;
use fuels::{
    prelude::ViewOnlyAccount,
    programs::{
        calls::{CallHandler, CallParameters},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, transaction_builders::VariableOutputPolicy},
};
use market::PriceDataUpdate;
use market_sdk::{convert_i256_to_u64, is_i256_negative, parse_units};

// Multiplies all values by this number
// It is necessary in order to test how the protocol works with large amounts
const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);

#[tokio::test]
async fn main_test() {
    let scale_6 = 10u64.pow(6) as f64;
    let scale_9 = 10u64.pow(9) as f64;

    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        chad,
        chad_account,
        usdc_contract,
        usdc,
        market,
        usdt,
        usdt_contract,
        oracle,
        price_feed_ids,
        assets,
        publish_time,
        prices,
        ..
    } = setup(None).await;

    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 1000.00 USDC

    let amount = parse_units(100 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(0, "Bob", "supply_base", log_amount.as_str());
    println!("💸 Bob + {log_amount}");

    // Transfer of 100 USDC to the Bob's wallet
    usdc_contract.mint(bob_account, amount).await.unwrap();

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

    // Сheck supply balance equal to 1000 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(supply_balance == amount as u128);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 200.00 USDT ~ $200.00

    let amount = parse_units(200 * AMOUNT_COEFFICIENT, usdt.decimals);
    let log_amount = format!("{} USDT", amount as f64 / scale_6);
    print_case_title(1, "Alice", "supply_collateral", log_amount.as_str());
    println!("💸 Alice + {log_amount}");

    // Transfer of 200 USDT to the Alice's wallet
    usdt_contract.mint(alice_account, amount).await.unwrap();

    let balance = alice.get_asset_balance(&usdt.asset_id).await.unwrap();
    assert!(balance == amount);

    // Alice calls supply_collateral
    market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_collateral(usdt.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 200 USDT
    let res = market
        .get_user_collateral(alice_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    assert!(res == amount);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 80.00 USDC

    let amount = parse_units(80 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(2, "Alice", "withdraw_base", log_amount.as_str());

    // Alice calls withdraw_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], amount, &price_data_update)
        .await
        .unwrap();

    // USDC balance check
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: supply_base
    // 💰 Amount: 90.00 USDC

    let amount = parse_units(90 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(4, "Chad", "supply_base", log_amount.as_str());
    println!("💸 Chad + {log_amount}");

    // Transfer of 20 USDC to the Chad's wallet
    usdc_contract.mint(chad_account, amount).await.unwrap();

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

    // Сheck supply balance equal to 90 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(chad_account).await.unwrap();
    assert!((amount as u128) - 5 < supply_balance);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: ~99.96 USDC (available_to_borrow)
    let amount = market
        .available_to_borrow(&[&oracle.instance], alice_account)
        .await
        .unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(5, "Alice", "withdraw_base", log_amount.as_str());

    // Alice calls withdraw_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            (amount - u128::from(parse_units(1, usdc.decimals)))
                .try_into()
                .unwrap(),
            &price_data_update,
        )
        .await
        .unwrap();

    // available_to_borrow should be 1 USDC
    let res = market
        .available_to_borrow(&[&oracle.instance], alice_account)
        .await
        .unwrap();

    assert!(res == u128::from(parse_units(1, usdc.decimals)) - 1);

    // Withdrawing more than available should fail (2 USDC)
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &[&oracle.instance],
            parse_units(2, usdc.decimals),
            &price_data_update,
        )
        .await
        .is_err();
    assert!(res);

    // USDC balance should be amount - 1 USDC + 1000 USDC from case #2
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(
        balance
            == (amount as u64) - parse_units(1, usdc.decimals)
                + parse_units(80 * AMOUNT_COEFFICIENT, usdc.decimals)
    );

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #6 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of collateral price
    // 💰 Amount: -30%

    print_case_title(6, "Admin", "Drop of collateral price", "-10%");
    let res = oracle.price(usdt.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.94) as u64;
    let prices = Vec::from([(
        usdt.price_feed_id,
        (
            new_price,
            usdt.price_feed_decimals,
            res.publish_time,
            res.confidence,
        ),
    )]);

    let price_data_update_old = price_data_update.clone();
    oracle.update_prices(&prices).await.unwrap();

    // New `price_data_update` that will be used in the next steps
    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids: vec![usdt.price_feed_id],
        publish_times: vec![tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    println!(
        "🔻 USDT price drops: ${}  -> ${}",
        res.price as f64 / 10_u64.pow(usdt.price_feed_decimals) as f64,
        new_price as f64 / 10_u64.pow(usdt.price_feed_decimals) as f64
    );
    let res = oracle.price(usdt.price_feed_id).await.unwrap().value;
    assert!(new_price == res.price);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #7 ====================
    // 👛 Wallet: Bob 🦹
    // 🤙 Call: absorb
    // 🔥 Target: Alice

    print_case_title(7, "Bob", "absorb", "Alice");

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], alice_account)
            .await
            .unwrap()
            .value
    );

    market
        .with_account(&bob)
        .await
        .unwrap()
        .absorb(&[&oracle.instance], vec![alice_account], &price_data_update)
        .await
        .unwrap();

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(alice_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(alice_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #8 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: 172.44 USDC

    let reserves = market
        .with_account(&bob)
        .await
        .unwrap()
        .get_collateral_reserves(usdt.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = market
        .collateral_value_to_sell(
            &[&oracle.instance],
            usdt.asset_id,
            convert_i256_to_u64(&reserves),
        )
        .await
        .unwrap()
        .value;

    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(8, "Bob", "buy_collateral", log_amount.as_str());

    // Transfer of amount to the wallet
    usdc_contract.mint(bob_account, amount).await.unwrap();

    // Сheck balance
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == (amount as u64));

    // Reset prices back to old values
    // This is used to test that multi_call_handler works correctly
    market
        .update_price_feeds_if_necessary(&[&oracle.instance], &price_data_update_old)
        .await
        .unwrap();

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
        .buy_collateral(usdt.asset_id, 1u64.into(), bob_account)
        .with_contracts(&[&oracle.instance])
        .with_tx_policies(tx_policies)
        .call_params(call_params_base_asset)
        .unwrap();

    let mutli_call_handler = CallHandler::new_multi_call(bob.clone())
        .add_call(update_balance_call)
        .add_call(buy_collateral_call)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Sumbit tx
    let submitted_tx = mutli_call_handler.submit().await.unwrap();

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    // Check
    let balance = bob.get_asset_balance(&usdt.asset_id).await.unwrap();
    println!("{}", balance);
    assert!(balance == parse_units(200, usdt.decimals) * AMOUNT_COEFFICIENT);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #12 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 270 USDT

    let amount = market
        .get_user_collateral(chad_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    let log_amount = format!("{} USDT", amount as f64 / scale_9);
    print_case_title(12, "Chad", "withdraw_collateral", log_amount.as_str());

    // USDT balance check
    let balance = chad.get_asset_balance(&usdt.asset_id).await.unwrap();
    assert!(balance == amount);

    market
        .print_debug_state(&wallets, &usdc, &usdt)
        .await
        .unwrap();
}
