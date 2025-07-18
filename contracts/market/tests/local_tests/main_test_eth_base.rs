use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::{
    accounts::Account,
    prelude::ViewOnlyAccount,
    programs::{
        calls::{CallHandler, CallParameters, ContractDependency},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, transaction_builders::VariableOutputPolicy, Bits256},
};
use market::{OracleInput, PythOracleInput};
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
        admin,
        alice,
        alice_account,
        bob,
        bob_account,
        chad,
        chad_account,
        market,
        mut oracle_inputs,
        oracle_total_update_fee,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        eth,
        usdt,
        usdt_contract,
        ..
    } = setup(None, TestBaseAsset::ETH).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 10.00 ETH

    let amount = parse_units(10 * AMOUNT_COEFFICIENT, eth.decimals);
    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(0, "Bob", "supply_base", log_amount.as_str());
    println!("💸 Bob + {log_amount}");

    // Bob calls supply_base
    market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_base(eth.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 10 ETH
    let (supply_balance, _) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(supply_balance == amount as u128);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: supply_collateral
    // 💰 Amount: 10000 USDT ~ $10000.00

    let amount = parse_units(10000 * AMOUNT_COEFFICIENT, usdt.decimals);
    let log_amount = format!("{} USDT", amount as f64 / scale_6);
    print_case_title(1, "Alice", "supply_collateral", log_amount.as_str());
    println!("💸 Alice + {log_amount}");

    // Transfer of 10000 USDT to the Alice's wallet
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

    // Сheck supply balance equal to 10000 USDT
    let res = market
        .get_user_collateral(alice_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    assert!(res == amount);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: 1 ETH

    let amount = parse_units(1 * AMOUNT_COEFFICIENT, eth.decimals);
    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(2, "Alice", "withdraw_base", log_amount.as_str());

    let old_balance = alice.get_asset_balance(&eth.asset_id).await.unwrap();

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

    // ETH balance check
    let balance = alice.get_asset_balance(&eth.asset_id).await.unwrap();
    assert!((balance - old_balance) == amount - oracle_total_update_fee);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: supply_collateral
    // 💰 Amount: 15000 USDT ~ $15000.00

    let amount = parse_units(15000 * AMOUNT_COEFFICIENT, usdt.decimals);
    let log_amount = format!("{} USDT", amount as f64 / scale_6);
    print_case_title(3, "Chad", "supply_collateral", log_amount.as_str());
    println!("💸 Chad + {log_amount}");

    // Transfer of 15000 USDT to the Chad's wallet
    usdt_contract.mint(chad_account, amount).await.unwrap();

    let balance = chad.get_asset_balance(&usdt.asset_id).await.unwrap();
    assert!(balance == amount);

    // Chad calls supply_collateral
    market
        .with_account(&chad)
        .await
        .unwrap()
        .supply_collateral(usdt.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 15000 USDT
    let res = market
        .get_user_collateral(chad_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    assert!(res == amount);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #4 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: supply_base
    // 💰 Amount: 20 ETH

    let amount = parse_units(20 * AMOUNT_COEFFICIENT, eth.decimals);
    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(4, "Chad", "supply_base", log_amount.as_str());
    println!("💸 Chad + {log_amount}");

    // Chad calls supply_base
    market
        .with_account(&chad)
        .await
        .unwrap()
        .supply_base(eth.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 20 ETH
    let (supply_balance, _) = market.get_user_supply_borrow(chad_account).await.unwrap();
    assert!((amount as u128) - 5 < supply_balance);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #5 ====================
    // 👛 Wallet: Alice 🦹
    // 🤙 Call: withdraw_base
    // 💰 Amount: ~1.57 ETH (available_to_borrow)
    let amount = market
        .available_to_borrow(
            &oracle_contracts,
            alice_account,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();
    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(5, "Alice", "withdraw_base", log_amount.as_str());

    let old_balance = alice.get_asset_balance(&eth.asset_id).await.unwrap();

    // Alice calls withdraw_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            (amount - u128::from(parse_units(1, eth.decimals - 3)))
                .try_into()
                .unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // available_to_borrow should be 0.00100000 ETH
    let res = market
        .available_to_borrow(
            &oracle_contracts,
            alice_account,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    assert!(res == u128::from(parse_units(1, eth.decimals - 3)) - 1);

    // Withdrawing more than available should fail (0.00200000 ETH)
    let res = market
        .with_account(&alice)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            parse_units(2, eth.decimals - 3),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .is_err();
    assert!(res);

    // ETH balance should be amount - ~1.57 ETH + 1 ETH from case #2
    let balance = alice.get_asset_balance(&eth.asset_id).await.unwrap();
    let amount: u64 = amount.try_into().unwrap();

    assert!(
        old_balance + amount - parse_units(1, eth.decimals - 3) - oracle_total_update_fee
            == balance
    );

    market
        .print_debug_state(&wallets, &eth, &usdt)
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
        .get_price(
            &oracle_contracts,
            usdt.asset_id,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap()
        .value;

    let (usdt_price_feed_id, usdt_price_feed_decimals) =
        pyth_asset_price_feeds.get(&usdt.asset_id).unwrap();
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
                                    if *price_feed_id == *usdt_price_feed_id {
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
                    update_fee: pyth_input.update_fee,
                    publish_times: pyth_input.publish_times,
                    price_feed_ids: pyth_input.price_feed_ids,
                    update_data: pyth_mock_oracle
                        .create_update_data(&new_prices)
                        .await
                        .unwrap(),
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
        .get_price(
            &oracle_contracts,
            usdt.asset_id,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap()
        .value;

    println!(
        "🔻 USDT price drops: ${}  -> ${}",
        old_price.price as f64 / 10_u64.pow(*usdt_price_feed_decimals) as f64,
        new_price.price as f64 / 10_u64.pow(*usdt_price_feed_decimals) as f64
    );

    market
        .print_debug_state(&wallets, &eth, &usdt)
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
            .is_liquidatable(
                &oracle_contracts,
                alice_account,
                &oracle_inputs,
                oracle_total_update_fee
            )
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
        .get_user_collateral(alice_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #8 ====================
    // 👛 Wallet: Bob 🤵
    // 🤙 Call: buy_collateral
    // 💰 Amount: ~2.77 ETH

    // Reset prices back to old values
    oracle_inputs = old_oracle_inputs.clone();
    market
        .update_price_feeds(&oracle_contracts, &oracle_inputs, oracle_total_update_fee)
        .await
        .unwrap();

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
            &oracle_contracts,
            usdt.asset_id,
            convert_i256_to_u64(&reserves),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap()
        .value;

    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(8, "Bob", "buy_collateral", log_amount.as_str());

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
        .with_asset_id(eth.asset_id);

    // Buy collateral with base asset
    let buy_collateral_call = market
        .instance
        .methods()
        .buy_collateral(
            usdt.asset_id,
            1u64.into(),
            bob_account,
            oracle_inputs.clone(),
        )
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
    let balance = bob.get_asset_balance(&usdt.asset_id).await.unwrap();
    println!("balance: {}", balance);
    println!(
        "expected: {}",
        parse_units(10000, usdt.decimals) * AMOUNT_COEFFICIENT - 2
    );
    assert!(balance == parse_units(10000, usdt.decimals) * AMOUNT_COEFFICIENT - 2); // -2 because some ETH is spent on tx fees

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #9 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 10.000050048 ETH

    let (amount, _) = market.get_user_supply_borrow(bob_account).await.unwrap();
    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(9, "Bob", "withdraw_base", log_amount.as_str());

    let old_balance = bob.get_asset_balance(&eth.asset_id).await.unwrap();

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

    // ETH balance check
    let balance = bob.get_asset_balance(&eth.asset_id).await.unwrap();
    assert!((balance - old_balance) == amount as u64 - oracle_total_update_fee);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #10 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 20.000050627 ETH

    let (amount, _) = market.get_user_supply_borrow(chad_account).await.unwrap();
    let log_amount = format!("{} ETH", amount as f64 / scale_9);
    print_case_title(10, "Chad", "withdraw_base", log_amount.as_str());

    let old_balance = chad.get_asset_balance(&eth.asset_id).await.unwrap();

    // Reserves are negative and we can't withdraw more ETH than is available
    // So we need to send some ETH to the contract to make the reserves positive
    admin
        .force_transfer_to_contract(
            market.contract_id(),
            parse_units(10, eth.decimals),
            eth.asset_id,
            tx_policies,
        )
        .await
        .unwrap();

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

    // ETH balance check
    let balance = chad.get_asset_balance(&eth.asset_id).await.unwrap();
    assert!((balance - old_balance) == amount as u64 - oracle_total_update_fee);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #11 ====================
    // 👛 Wallet: Chad 🤵
    // 🤙 Call: withdraw_collateral
    // 💰 Amount: 15000 USDT

    let amount = market
        .get_user_collateral(chad_account, usdt.asset_id)
        .await
        .unwrap()
        .value;
    let log_amount = format!("{} USDT", amount as f64 / scale_6);
    print_case_title(12, "Chad", "withdraw_collateral", log_amount.as_str());

    // Chad calls withdraw_collateral
    market
        .with_account(&chad)
        .await
        .unwrap()
        .withdraw_collateral(
            &oracle_contracts,
            usdt.asset_id,
            amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // USDT balance check
    let balance = chad.get_asset_balance(&usdt.asset_id).await.unwrap();
    assert!(balance == amount);

    market
        .print_debug_state(&wallets, &eth, &usdt)
        .await
        .unwrap();
}
