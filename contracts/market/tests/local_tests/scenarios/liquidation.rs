use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::{
    accounts::ViewOnlyAccount,
    programs::{
        calls::{CallHandler, CallParameters, ContractDependency},
        responses::CallResponse,
    },
    types::{
        transaction::TxPolicies, transaction_builders::VariableOutputPolicy, Bits256, ContractId,
    },
};
use market::{OracleInput, PythOracleInput};
use market_sdk::{
    convert_i256_to_i128, convert_i256_to_u64, convert_u256_to_u128, format_units_u128,
    is_i256_negative, parse_units,
};

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn absorb_and_liquidate() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        chad,
        market,
        usdc,
        eth,
        mut oracle_inputs,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        oracle_total_update_fee,
        usdc_contract,
        oracle_contract_id_to_index,
        ..
    } = setup(None, TestBaseAsset::USDC, None).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

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
        .mint(alice_account, alice_mint_amount)
        .await
        .unwrap();
    let balance: u64 = alice
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
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
        .get_user_collateral(bob_account, eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(bob_user_collateral == bob_supply_amount);

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
        .available_to_borrow(&oracle_contracts, bob_account)
        .await
        .unwrap();
    let log_amount = format!("{} USDC", max_borrow_amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", &log_amount.as_str());
    let bob_borrow_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            max_borrow_amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(bob_borrow_res.is_ok());

    let balance: u64 = bob
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
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

    let old_price = market
        .get_price(&oracle_contracts, eth.asset_id)
        .await
        .unwrap()
        .value;

    let (eth_price_feed_id, eth_price_feed_decimals) =
        pyth_asset_price_feeds.get(&eth.asset_id).unwrap();
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
                                    if *price_feed_id == *eth_price_feed_id {
                                        (*price as f64 * 0.5) as u64
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
                    oracle_id: *oracle_contract_id_to_index
                        .get(&ContractId::from(pyth_mock_oracle.instance.contract_id()))
                        .unwrap(),

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
        .get_price(&oracle_contracts, eth.asset_id)
        .await
        .unwrap()
        .value;

    println!(
        "🔻 ETH price drops: ${}  -> ${}. Decimals: {}",
        old_price.price, new_price.price, eth_price_feed_decimals
    );

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
            .is_liquidatable(&oracle_contracts, bob_account)
            .await
            .unwrap()
            .value
    );

    let chad_absorb_bob_res = market
        .with_account(&chad)
        .await
        .unwrap()
        .absorb(
            &oracle_contracts,
            vec![bob_account],
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(chad_absorb_bob_res.is_ok());

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(bob_account, eth.asset_id)
        .await
        .unwrap()
        .value;
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
        .get_collateral_reserves(eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = market
        .collateral_value_to_sell(
            &oracle_contracts,
            eth.asset_id,
            convert_i256_to_u64(&reserves),
        )
        .await
        .unwrap()
        .value;

    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(5, "Alice", "buy_collateral", log_amount.as_str());

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
    usdc_contract
        .mint(alice_account, amount.try_into().unwrap())
        .await
        .unwrap();

    let buy_collateral_call = market
        .instance
        .methods()
        .buy_collateral(eth.asset_id, 1u64.into(), alice_account)
        .with_contracts(&oracle_contracts)
        .with_tx_policies(tx_policies)
        .call_params(call_params_base_asset)
        .unwrap();

    let multi_call_handler = CallHandler::new_multi_call(alice.clone())
        .add_call(update_balance_call)
        .add_call(buy_collateral_call)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Sumbit tx
    let submitted_tx = multi_call_handler.submit().await.unwrap();

    // Wait a bit for the transaction to be committed
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    let alice_balance: u64 = alice
        .get_asset_balance(&eth.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(alice_balance == 1_000_999_999_992 * AMOUNT_COEFFICIENT);

    // check reserves
    let reserves = market
        .with_account(&alice)
        .await
        .unwrap()
        .get_collateral_reserves(eth.asset_id)
        .await
        .unwrap()
        .value;
    let normalized_reserves: u64 = convert_i256_to_i128(&reserves).try_into().unwrap();
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
        alice_account,
        bob,
        bob_account,
        chad,
        market,
        usdc,
        eth,
        mut oracle_inputs,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        oracle_total_update_fee,
        usdc_contract,
        oracle_contract_id_to_index,
        ..
    } = setup(None, TestBaseAsset::USDC, None).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

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
        .mint(alice_account, alice_mint_amount)
        .await
        .unwrap();
    let balance: u64 = alice
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
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
        .get_user_collateral(bob_account, eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(bob_user_collateral == bob_supply_amount);

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
        .available_to_borrow(&oracle_contracts, bob_account)
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
            &oracle_contracts,
            max_borrow_amount.try_into().unwrap(),
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(bob_withdraw_res.is_ok());

    let balance: u64 = bob
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
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

    let old_price = market
        .get_price(&oracle_contracts, eth.asset_id)
        .await
        .unwrap()
        .value;

    let (eth_price_feed_id, eth_price_feed_decimals) =
        pyth_asset_price_feeds.get(&eth.asset_id).unwrap();
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
                                    if *price_feed_id == *eth_price_feed_id {
                                        (*price as f64 * 0.5) as u64
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
                    oracle_id: *oracle_contract_id_to_index
                        .get(&ContractId::from(pyth_mock_oracle.instance.contract_id()))
                        .unwrap(),

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
        .get_price(&oracle_contracts, eth.asset_id)
        .await
        .unwrap()
        .value;

    println!(
        "🔻 ETH price drops: ${}  -> ${}. Decimals: {}",
        old_price.price, new_price.price, eth_price_feed_decimals
    );

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
            .is_liquidatable(&oracle_contracts, bob_account)
            .await
            .unwrap()
            .value
    );

    let chad_absorb_bob_res = market
        .with_account(&chad)
        .await
        .unwrap()
        .absorb(
            &oracle_contracts,
            vec![bob_account],
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(chad_absorb_bob_res.is_ok());

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(bob_account, eth.asset_id)
        .await
        .unwrap()
        .value;
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
        .get_collateral_reserves(eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = market
        .collateral_value_to_sell(
            &oracle_contracts,
            eth.asset_id,
            convert_i256_to_u64(&reserves),
        )
        .await
        .unwrap()
        .value;

    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(5, "Alice", "buy_collateral", log_amount.as_str());

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
        .buy_collateral(eth.asset_id, 1u64.into(), alice_account)
        .with_contracts(&oracle_contracts)
        .with_tx_policies(tx_policies)
        .call_params(call_params_base_asset)
        .unwrap();

    let multi_call_handler = CallHandler::new_multi_call(alice.clone())
        .add_call(update_balance_call)
        .add_call(buy_collateral_call)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Sumbit tx
    let submitted_tx = multi_call_handler.submit().await.unwrap();

    // Wait a bit for the transaction to be committed
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    // Check asset balance
    let balance: u64 = alice
        .get_asset_balance(&eth.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == 1_000_999_999_992 * AMOUNT_COEFFICIENT);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}

#[tokio::test]
async fn is_liquidatable_internal_uses_correct_index() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        chad,
        market,
        usdc,
        uni,
        oracle_inputs,
        pyth_mock_oracle,
        pyth_asset_price_feeds,
        oracle_total_update_fee,
        usdc_contract,
        uni_contract,
        ..
    } = setup(Some(100_000_000), TestBaseAsset::USDC, None).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 10K USDC
    let amount = parse_units(10000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", log_amount.as_str());
    println!("💸 Alice + {log_amount}");

    // Transfer of 10K USDC to the Alice's wallet
    usdc_contract.mint(alice_account, amount).await.unwrap();
    let balance: u64 = alice
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == amount);

    // Alice calls supply_base
    market
        .with_account(&alice)
        .await
        .unwrap()
        .supply_base(usdc.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 10K USDC
    let (supply_balance, _) = market.get_user_supply_borrow(alice_account).await.unwrap();
    assert!(supply_balance == amount as u128);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #1 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: supply_collateral
    // 💰 Amount: 1K UNI ~ $5K
    let amount = parse_units(1000 * AMOUNT_COEFFICIENT, uni.decimals);
    let log_amount = format!("{} UNI", amount as f64 / SCALE_9);
    print_case_title(1, "Bob", "supply_collateral", log_amount.as_str());
    println!("💸 Bob + {log_amount}");

    // Transfer of 1K UNI to the Bob's wallet
    uni_contract.mint(bob_account, amount).await.unwrap();

    let balance: u64 = bob
        .get_asset_balance(&uni.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == amount);

    // Bob calls supply_collateral
    market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(uni.asset_id, amount)
        .await
        .unwrap();

    // Сheck supply balance equal to 1K UNI
    let res = market
        .get_user_collateral(bob_account, uni.asset_id)
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
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 2K USDC
    let amount = parse_units(2500 * AMOUNT_COEFFICIENT, usdc.decimals);
    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", log_amount.as_str());

    // Bob calls withdraw_base
    market
        .with_account(&bob)
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
    let balance: u64 = bob
        .get_asset_balance(&usdc.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == amount);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();

    for _ in 0..6 {
        market.debug_increment_timestamp().await.unwrap();
    }

    // Calculate liqudiation point, wrong present value and correct present value
    let collateral_configurations = market.get_collateral_configurations().await.unwrap().value;
    let uni_config = collateral_configurations
        .iter()
        .find(|config| config.asset_id == uni.asset_id);

    let market_basics = market.get_market_basics_with_interest().await.unwrap();

    let liquidation_factor = format_units_u128(
        convert_u256_to_u128(uni_config.unwrap().liquidate_collateral_factor),
        18,
    );

    let borrow_factor = format_units_u128(
        convert_u256_to_u128(uni_config.unwrap().borrow_collateral_factor),
        18,
    );

    let uni_price = market
        .get_price(&oracle_contracts, uni.asset_id)
        .await
        .unwrap()
        .value;

    let (_, uni_price_feed_decimals) = pyth_asset_price_feeds.get(&uni.asset_id).unwrap();
    let uni_price =
        u64::try_from(uni_price.price).unwrap() as f64 / 10u64.pow(*uni_price_feed_decimals) as f64;

    let borrow_limit = borrow_factor * uni_price * 1000_f64;
    let liquidation_point = liquidation_factor * uni_price * 1000_f64;

    let base_supply_index = format_units_u128(
        convert_u256_to_u128(market_basics.value.base_supply_index),
        15,
    );

    let base_borrow_index = format_units_u128(
        convert_u256_to_u128(market_basics.value.base_borrow_index),
        15,
    );

    let user_principal = market
        .get_user_basic(bob_account)
        .await
        .unwrap()
        .value
        .principal;

    let user_principal =
        convert_i256_to_i128(&user_principal) as f64 / 10u64.pow(usdc.decimals as u32) as f64;

    let wrong_present_value = base_supply_index * user_principal;
    let correct_present_value = base_borrow_index * user_principal;

    println!("\n==================== INFO ====================");
    println!(
        "📈 Borrow limit: {borrow_limit:?}\n📈 Liquidation point: {liquidation_point:?}\n📈 User principal: {user_principal:?}\n📈 Wrong present value: {wrong_present_value:?}\n📈 Correct present value: {correct_present_value:?}",
    );
    print!("==============================================");

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Chad 🧛
    // 🤙 Call: absorb
    // 🔥 Target: Bob
    print_case_title(3, "Chad", "absorb", "Bob");

    // `is_liquidatable` accrues iterest first, so this must return `true`
    assert!(
        market
            .is_liquidatable(&oracle_contracts, bob_account)
            .await
            .unwrap()
            .value
            == true
    );

    // This should work
    market
        .with_account(&chad)
        .await
        .unwrap()
        .absorb(
            &oracle_contracts,
            vec![bob_account],
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await
        .unwrap();

    // Check if absorb was ok
    let (_, borrow) = market.get_user_supply_borrow(bob_account).await.unwrap();
    assert!(borrow == 0);

    let amount = market
        .get_user_collateral(bob_account, uni.asset_id)
        .await
        .unwrap()
        .value;
    assert!(amount == 0);

    market
        .print_debug_state(&wallets, &usdc, &uni)
        .await
        .unwrap();
}
