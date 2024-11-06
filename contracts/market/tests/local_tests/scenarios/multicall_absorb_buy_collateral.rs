use crate::utils::{print_case_title, setup, TestBaseAsset, TestData};
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
    let alice_supply_amount = parse_units(1000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let alice_mint_amount = parse_units(2000 * AMOUNT_COEFFICIENT, usdc.decimals);
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
        .withdraw_base(&[&oracle.instance], bob_borrow_amount, &price_data_update)
        .await;
    assert!(bob_borrow_res.is_ok(), "{:?}", bob_borrow_res.err());

    market.debug_increment_timestamp().await.unwrap();

    // =================================================
    // ==================== Step #3 ====================
    // 👛 Wallet: Admin 🗿
    // 🤙 Drop of ETH price
    // 💰 Amount: -70%
    print_case_title(3, "Admin", "Drop of ETH price", "-70%");
    let res = oracle.price(eth.price_feed_id).await.unwrap().value;
    let new_price = (res.price as f64 * 0.3) as u64;
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
        update_fee: 1,
        price_feed_ids: vec![eth.price_feed_id],
        publish_times: vec![tai64::Tai64::from_unix(Utc::now().timestamp().try_into().unwrap()).0],
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
    // 🤙 Call: absorb then buy_collateral using multicall
    // 🔥 Target: Bob
    print_case_title(4, "Chad", "absorb then buy_collateral", "Bob");

    assert!(
        market
            .is_liquidatable(&[&oracle.instance], bob_account)
            .await
            .unwrap()
            .value
    );

    // Absorb
    let absorb_call = market
        .instance
        .methods()
        .absorb(vec![bob_account], price_data_update.clone())
        .with_contracts(&[&oracle.instance])
        .call_params(CallParameters::default().with_amount(price_data_update.update_fee))
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
        .with_contracts(&[&oracle.instance])
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

    // Wait for response
    let _: CallResponse<((), ())> = submitted_tx.response().await.unwrap();

    // Check asset balance
    let balance = chad.get_asset_balance(&eth.asset_id).await.unwrap();
    assert!(balance == 1000_998_986_826 - 1); // subtract oracle update fee

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
