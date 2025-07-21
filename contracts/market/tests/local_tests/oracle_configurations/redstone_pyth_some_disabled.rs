use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::{
    prelude::ViewOnlyAccount,
    programs::{
        calls::{CallHandler, CallParameters, ContractDependency},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, transaction_builders::VariableOutputPolicy, Bits256, U256},
};
use market::{OracleInput, PythOracleInput, RedstoneOracleInput};
use market_sdk::{convert_i256_to_u64, is_i256_negative, parse_units};

// Multiplies all values by this number
// It is necessary in order to test how the protocol works with large amounts
const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);

#[tokio::test]
async fn redstone_pyth_some_disabled() {
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
        uni,
        uni_contract,
        mut oracle_inputs,
        oracle_total_update_fee,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        redstone_mock_oracle,
        redstone_prices,
        redstone_asset_price_feeds,
        ..
    } = setup(
        None,
        TestBaseAsset::USDC,
        Some("tokens-pyth-redstone-some-disabled.json"),
    )
    .await;

    let oracle_contracts: Vec<&dyn ContractDependency> =
        vec![&pyth_mock_oracle.instance, &redstone_mock_oracle.instance];

    let oracle_asset_configurations = market
        .get_oracle_asset_configurations()
        .await
        .unwrap()
        .value;

    // Disable Pyth for USDC
    let mut usdc_oracle_configuration = oracle_asset_configurations
        .iter()
        .find(|(asset_id, _)| *asset_id == usdc.asset_id)
        .unwrap()
        .1
        .iter()
        .find(|oracle_configuration| oracle_configuration.oracle_id == 0)
        .unwrap()
        .clone();

    usdc_oracle_configuration.is_disabled = true;

    market
        .update_asset_oracle(usdc.asset_id, &usdc_oracle_configuration)
        .await
        .unwrap();

    // Disable Redstone for UNI
    let mut uni_oracle_configuration = oracle_asset_configurations
        .iter()
        .find(|(asset_id, _)| *asset_id == uni.asset_id)
        .unwrap()
        .1
        .iter()
        .find(|oracle_configuration| oracle_configuration.oracle_id == 1)
        .unwrap()
        .clone();

    uni_oracle_configuration.is_disabled = true;

    market
        .update_asset_oracle(uni.asset_id, &uni_oracle_configuration)
        .await
        .unwrap();

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

    // Сheck supply balance equal to 400 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(supply_balance == amount as u128);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

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
    uni_contract.mint(alice_account, amount).await.unwrap();

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
        .get_user_collateral(alice_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(res == amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

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
        .withdraw_base(
            &oracle_contracts,
            amount,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // USDC balance check
    let balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

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
    uni_contract.mint(chad_account, amount).await.unwrap();

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
        .get_user_collateral(chad_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(res == amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

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

    // Сheck supply balance equal to 200 USDC
    let (supply_balance, _) = market.get_user_supply_borrow(chad_account).await.unwrap();
    assert!((amount as u128) - 5 < supply_balance);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: ~49.99 USDC (available_to_borrow)
    let amount = market
        .available_to_borrow(&oracle_contracts, alice_account)
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
            &oracle_contracts,
            (amount - u128::from(parse_units(1, usdc.decimals)))
                .try_into()
                .unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // available_to_borrow should be 1 USDC
    let res = market
        .available_to_borrow(&oracle_contracts, alice_account)
        .await
        .unwrap();

    assert!(res == u128::from(parse_units(1, usdc.decimals)) - 1);

    // Withdrawing more than available should fail (2 USDC)
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            parse_units(2, usdc.decimals),
            &oracle_inputs,
            oracle_total_update_fee,
        )
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

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #6 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of collateral price
    // 💰 Amount: -30%

    print_case_title(6, "Admin", "Drop of collateral price", "-30%");

    let old_price = market
        .get_price(&oracle_contracts, uni.asset_id)
        .await
        .unwrap()
        .value;

    let (redstone_uni_price_feed_id, _) = redstone_asset_price_feeds.get(&uni.asset_id).unwrap();
    let (pyth_uni_price_feed_id, _) = pyth_asset_price_feeds.get(&uni.asset_id).unwrap();
    let old_oracle_inputs = oracle_inputs.clone();
    let mut new_oracle_inputs = Vec::new();

    for input in oracle_inputs.iter() {
        let input = input.clone();

        let processed_input = match input {
            OracleInput::Pyth(pyth_input) => {
                let new_prices = pyth_prices
                    .iter()
                    .map(
                        |(
                            price_feed_id,
                            (price, price_feed_decimals, publish_time, confidence),
                        )| {
                            (
                                *price_feed_id,
                                (
                                    if *price_feed_id == *pyth_uni_price_feed_id {
                                        (*price as f64 * 0.7) as u64
                                    } else {
                                        *price
                                    },
                                    *price_feed_decimals,
                                    *publish_time,
                                    *confidence,
                                ),
                            )
                        },
                    )
                    .collect::<Vec<(Bits256, (u64, u32, u64, u64))>>();

                OracleInput::Pyth(PythOracleInput {
                    contract_id: pyth_input.contract_id,
                    price_feed_ids: pyth_input.price_feed_ids,
                    update_fee: pyth_input.update_fee,
                    publish_times: pyth_input.publish_times,
                    update_data: pyth_mock_oracle
                        .create_update_data(&new_prices)
                        .await
                        .unwrap(),
                })
            }
            OracleInput::Redstone(redstone_input) => {
                let new_prices = redstone_prices
                    .iter()
                    .map(
                        |(
                            price_feed_id,
                            (price, price_feed_decimals, publish_time, confidence),
                        )| {
                            (
                                *price_feed_id,
                                (
                                    if *price_feed_id == *redstone_uni_price_feed_id {
                                        (*price as f64 * 0.7) as u64
                                    } else {
                                        *price
                                    },
                                    *price_feed_decimals,
                                    *publish_time,
                                    *confidence,
                                ),
                            )
                        },
                    )
                    .collect::<Vec<(U256, (u64, u32, u64, u64))>>();

                let (_, payload) = redstone_mock_oracle
                    .create_update_data(&new_prices)
                    .await
                    .unwrap();

                OracleInput::Redstone(RedstoneOracleInput {
                    contract_id: redstone_input.contract_id,
                    price_feed_ids: redstone_input.price_feed_ids,
                    payload,
                })
            }
            _ => input,
        };

        new_oracle_inputs.push(processed_input);
    }

    oracle_inputs = new_oracle_inputs;

    // Update price feeds
    market
        .update_price_feeds(&oracle_contracts, &oracle_inputs, oracle_total_update_fee)
        .await
        .unwrap();

    // Get new price
    let new_price = market
        .get_price(&oracle_contracts, uni.asset_id)
        .await
        .unwrap()
        .value;

    println!(
        "🔻 UNI price drops: ${}  -> ${}",
        old_price.price as f64 / 10_u64.pow(old_price.exponent) as f64,
        new_price.price as f64 / 10_u64.pow(new_price.exponent) as f64
    );

    market
        .print_debug_state(&wallets, &usdc, &uni)
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
            .is_liquidatable(&oracle_contracts, alice_account)
            .await
            .unwrap()
            .value
    );

    market
        .with_account(&bob)
        .await
        .unwrap()
        .absorb(
            &oracle_contracts,
            vec![alice_account],
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(alice_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(alice_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #8 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: 119 USDC

    let reserves = market
        .with_account(&bob)
        .await
        .unwrap()
        .get_collateral_reserves(uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = market
        .collateral_value_to_sell(
            &oracle_contracts,
            uni.asset_id,
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
    // This is used to test that `multi_call_handler` method works correctly
    // And it will use the new price feeds (not the old ones, as we set them here)
    market
        .update_price_feeds(
            &oracle_contracts,
            &old_oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // Prepare calls for multi_call_handler
    let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);

    // Params for update_price_feeds_if_necessary
    let call_params_update_price = CallParameters::default().with_amount(oracle_total_update_fee);

    // Update price feeds if necessary
    let update_balance_call = market
        .instance
        .methods()
        .update_price_feeds(oracle_inputs.clone())
        .with_contracts(&oracle_contracts)
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
        .buy_collateral(uni.asset_id, 1u64.into(), bob_account)
        .with_contracts(&oracle_contracts)
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
    let balance = bob.get_asset_balance(&uni.asset_id).await.unwrap();
    println!("balance: {}", balance);
    println!(
        "expected: {}",
        parse_units(40, uni.decimals) * AMOUNT_COEFFICIENT
    );
    assert!(balance == parse_units(40, uni.decimals) * AMOUNT_COEFFICIENT);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #9 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 100.002259 USDC

    let (amount, _) = market.get_user_supply_borrow(bob_account).await.unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(9, "Bob", "withdraw_base", log_amount.as_str());

    // Bob calls withdraw_base
    market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // Check supplied is 0
    let (supplied, _) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(supplied == 0);

    // USDC balance check
    assert!(bob.get_asset_balance(&usdc.asset_id).await.unwrap() == amount as u64);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #10 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 200.002043 USDC

    let (amount, _) = market.get_user_supply_borrow(chad_account).await.unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(10, "Chad", "withdraw_base", log_amount.as_str());

    // Chad calls withdraw_base
    market
        .with_account(&chad)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // Check supplied is 0
    let (supplied, _) = market.get_user_supply_borrow(chad_account).await.unwrap();
    assert!(supplied == 0);

    // USDC balance check
    assert!(chad.get_asset_balance(&usdc.asset_id).await.unwrap() == amount as u64);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #11 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 5.998373 USDC

    let (amount, _) = market.get_user_supply_borrow(alice_account).await.unwrap();
    let log_amount = format!("{} USDC", amount as f64 / scale_6);
    print_case_title(11, "Alice", "withdraw_base", log_amount.as_str());

    // Alice calls withdraw_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // USDC balance check
    let (supplied, _) = market.get_user_supply_borrow(alice_account).await.unwrap();
    assert!(supplied == 0);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #12 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 60 UNI

    let amount = market
        .get_user_collateral(chad_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    let log_amount = format!("{} UNI", amount as f64 / scale_9);
    print_case_title(12, "Chad", "withdraw_collateral", log_amount.as_str());

    // Chad calls withdraw_collateral
    market
        .with_account(&chad)
        .await
        .unwrap()
        .withdraw_collateral(
            &oracle_contracts,
            uni.asset_id,
            amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // UNI balance check
    let balance = chad.get_asset_balance(&uni.asset_id).await.unwrap();
    assert!(balance == amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
}
