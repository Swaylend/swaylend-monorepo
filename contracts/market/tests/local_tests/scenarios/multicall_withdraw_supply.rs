use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
use fuels::{
    accounts::ViewOnlyAccount,
    programs::{
        calls::{CallHandler, CallParameters},
        responses::CallResponse,
    },
    types::{transaction::TxPolicies, transaction_builders::VariableOutputPolicy},
};
use market::PriceDataUpdate;
use market_sdk::parse_units;

const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);
const SCALE_6: f64 = 10u64.pow(6) as f64;
const SCALE_9: f64 = 10u64.pow(9) as f64;

#[tokio::test]
async fn multicall_withdraw_supply_test() {
    let TestData {
        wallets,
        alice,
        alice_account,
        bob,
        bob_account,
        market,
        usdc,
        usdc_contract,
        eth,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        assets,
        ..
    } = setup(None, TestBaseAsset::USDC).await;

    let price_data_update = PriceDataUpdate {
        update_fee: 1,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // =================================================
    // ==================== Step #0 ====================
    // 👛 Wallet: Alice 🧛
    // 🤙 Call: supply_base
    // 💰 Amount: 1000.00 USDC
    let alice_supply_amount = parse_units(3000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(4000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_supply_log_amount = format!("{} USDC", alice_supply_amount as f64 / SCALE_6);
    print_case_title(0, "Alice", "supply_base", alice_supply_log_amount.as_str());
    println!("💸 Alice + {alice_supply_log_amount}");
    usdc_contract
        .mint(alice_account, alice_mint_amount)
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
    let bob_supply_res = market
        .with_account(&bob)
        .await
        .unwrap()
        .supply_collateral(eth.asset_id, bob_supply_amount)
        .await;
    assert!(bob_supply_res.is_ok());

    market.debug_increment_timestamp().await.unwrap();

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // =================================================
    // ==================== Step #2 ====================
    // 👛 Wallet: Bob 🧛
    // 🤙 Call: withdraw_base then supply_base using multicall
    // 💰 Amount: 500.00 USDC
    let bob_mint_amount = parse_units(500 * AMOUNT_COEFFICIENT, usdc.decimals);
    usdc_contract
        .mint(bob_account, bob_mint_amount)
        .await
        .unwrap();
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == bob_mint_amount);
    let bob_withdraw_amount = parse_units(100 * AMOUNT_COEFFICIENT, usdc.decimals);
    let bob_withdraw_log_amount = format!("{} USDC", bob_withdraw_amount as f64 / SCALE_6);
    print_case_title(
        2,
        "Bob",
        "withdraw_base then supply_base",
        bob_withdraw_log_amount.as_str(),
    );

    let tx_policies = TxPolicies::default().with_script_gas_limit(1_000_000);

    // Withdraw base
    let withdraw_base_call = market
        .instance
        .methods()
        .withdraw_base(bob_withdraw_amount.into(), price_data_update.clone())
        .with_contracts(&[&oracle.instance])
        .with_tx_policies(tx_policies)
        .call_params(CallParameters::default().with_amount(price_data_update.update_fee))
        .unwrap();

    // Supply base
    let supply_base_call = market
        .instance
        .methods()
        .supply_base()
        .with_tx_policies(tx_policies)
        .call_params(
            CallParameters::default()
                .with_amount(bob_withdraw_amount)
                .with_asset_id(usdc.asset_id),
        )
        .unwrap();

    let multi_call_handler = CallHandler::new_multi_call(bob.clone())
        .add_call(withdraw_base_call)
        .add_call(supply_base_call)
        .with_variable_output_policy(VariableOutputPolicy::Exactly(2));

    // Submit tx
    let submitted_tx = multi_call_handler.submit().await.unwrap();

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    // Check asset balance
    let balance = bob.get_asset_balance(&usdc.asset_id).await.unwrap();
    assert!(balance == bob_mint_amount);

    market
        .print_debug_state(&wallets, &usdc, &usdc)
        .await
        .unwrap();
}
