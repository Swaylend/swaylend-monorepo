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
use market_sdk::{is_i256_negative, parse_units};

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn multicall_absorb_buy_collateral_test() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        chad,
        chad_account,
        market,
        usdc,
        usdc_contract,
        eth,
        mut oracle_inputs,
        pyth_mock_oracle,
        pyth_prices,
        pyth_asset_price_feeds,
        oracle_total_update_fee,
        oracle_contract_id_to_index,
        ..
    } = setup(None, TestBaseAsset::USDC, None).await;

    let oracle_contracts: Vec<&dyn ContractDependency> = vec![&pyth_mock_oracle.instance];

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 1000.00 USDC
    let alice_supply_amount = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(2000 * AMOUNT_COEFFICIENT, usdc.decimals);
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

    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base
    // 💰 Amount: 1000.00 USDC
    let bob_borrow_amount = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_borrow_log_amount = format!("{} USDC", bob_borrow_amount as f64 / SCALE_6);
    print_case_title(2, "Bob", "withdraw_base", bob_borrow_log_amount.as_str());
    println!("💸 Bob - {bob_borrow_log_amount}");
    let bob_borrow_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(
            &oracle_contracts,
            bob_borrow_amount,
            &oracle_inputs,
            oracle_total_update_fee,
        )
        .await;
    assert!(bob_borrow_res.is_ok(), "{:?}", bob_borrow_res.err());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of ETH price
    // 💰 Amount: -70%
    print_case_title(3, "Admin", "Drop of ETH price", "-70%");

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
                                        (*price as f64 * 0.3) as u64
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
    // 🤙 Call: absorb then buy_collateral using multicall
    // 🔥 Target: Bob
    print_case_title(4, "Chad", "absorb then buy_collateral", "Bob");

    assert!(
        market
            .is_liquidatable(&oracle_contracts, bob_account)
            .await
            .unwrap()
            .value
    );

    // Absorb
    let absorb_call = market
        .instance
        .methods()
        .absorb(vec![bob_account], oracle_inputs.clone())
        .with_contracts(&oracle_contracts)
        .call_params(CallParameters::default().with_amount(oracle_total_update_fee))
        .unwrap();

    // Check reserves are not negative
    let reserves = market
        .with_account(&chad)
        .await
        .unwrap()
        .get_collateral_reserves(eth.asset_id)
        .await
        .unwrap()
        .value;
    assert!(!is_i256_negative(&reserves));

    let amount = parse_units(986 * AMOUNT_COEFFICIENT, usdc.decimals);

    let log_amount = format!("{} USDC", amount as f64 / SCALE_6);
    println!("💸 Chad - {log_amount}");

    usdc_contract
        .mint(chad_account, amount.try_into().unwrap())
        .await
        .unwrap();

    let buy_collateral_call = market
        .instance
        .methods()
        .buy_collateral(eth.asset_id, amount, chad_account)
        .with_contracts(&oracle_contracts)
        .call_params(
            CallParameters::default()
                .with_amount(amount as u64)
                .with_asset_id(usdc.asset_id),
        )
        .unwrap();

    let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);

    let multi_call_handler = CallHandler::new_multi_call(chad.clone())
        .add_call(absorb_call)
        .add_call(buy_collateral_call)
        .with_tx_policies(tx_policies)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Submit tx
    let submitted_tx = multi_call_handler.submit().await.unwrap();

    // Wait a bit for the transaction to be committed
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    // Check asset balance
    let balance: u64 = chad
        .get_asset_balance(&eth.asset_id)
        .await
        .unwrap()
        .try_into()
        .unwrap();
    assert!(balance == 1000_998_986_826 - oracle_total_update_fee); // subtract oracle update fee

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
