use crate::utils::{setup, TestData};
use fuels::{accounts::Account, types::transaction::TxPolicies};
use market::PriceDataUpdate;
use market_sdk::{convert_i256_to_i128, convert_i256_to_i64, parse_units};
const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);

#[tokio::test]
async fn reserves_test() {
    let TestData {
        wallets,
        bob,
        bob_account,
        alice,
        alice_account,
        market,
        assets,
        usdc,
        usdc_contract,
        oracle,
        price_feed_ids,
        publish_time,
        prices,
        eth,
        admin,
        admin_account,
        ..
    } = setup(None).await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // Scenario #4 Steps repeated multiple times
    for _ in 0..3 {
        // Step 0: Alice supplies 4000 USDC
        let alice_supply_amount = parse_units(4000 * AMOUNT_COEFFICIENT, usdc.decimals);
        usdc_contract
            .mint(alice_account, alice_supply_amount)
            .await
            .unwrap();
        let res = market
            .with_account(&alice)
            .await
            .unwrap()
            .supply_base(usdc.asset_id, alice_supply_amount)
            .await;
        assert!(res.is_ok());
        market.debug_increment_timestamp().await.unwrap();

        // Step 1: Bob supplies 2 ETH
        let bob_supply_amount = parse_units(2 * AMOUNT_COEFFICIENT, eth.decimals);
        let res = market
            .with_account(&bob)
            .await
            .unwrap()
            .supply_collateral(eth.asset_id, bob_supply_amount)
            .await;
        assert!(res.is_ok());
        market.debug_increment_timestamp().await.unwrap();

        // Step 2: Bob borrows 4000 USDC
        let borrow_amount = parse_units(4000 * AMOUNT_COEFFICIENT, usdc.decimals);
        let res = market
            .with_account(&bob)
            .await
            .unwrap()
            .withdraw_base(&[&oracle.instance], borrow_amount, &price_data_update)
            .await;
        assert!(res.is_ok());

        // Simulate time passing to accrue interest
        market.debug_increment_timestamp().await.unwrap();

        // Step 3: Bob repays 4000 USDC
        let res = market.get_user_basic(bob_account).await.unwrap();
        let abc = convert_i256_to_i64(&res.value.principal);
        println!("abc: {abc}");
        let principal_value: u64 = convert_i256_to_i64(&res.value.principal).abs() as u64;
        let repay_amount: u64 = principal_value + parse_units(10, usdc.decimals);

        usdc_contract.mint(bob_account, repay_amount).await.unwrap();
        let res = market
            .with_account(&bob)
            .await
            .unwrap()
            .supply_base(usdc.asset_id, repay_amount)
            .await;
        assert!(res.is_ok());
        market.debug_increment_timestamp().await.unwrap();

        // Step 4: Bob withdraws 2 ETH
        let res = market
            .with_account(&bob)
            .await
            .unwrap()
            .withdraw_collateral(
                &[&oracle.instance],
                eth.asset_id,
                bob_supply_amount,
                &price_data_update,
            )
            .await;
        assert!(res.is_ok(), "{:?}", res.err());
        market.debug_increment_timestamp().await.unwrap();

        market
            .print_debug_state(&wallets, &usdc, &eth)
            .await
            .unwrap();
    }

    // Check reserves
    let reserves = market.get_reserves().await.unwrap().value;
    let normalized_reserves: u64 = convert_i256_to_i128(&reserves).try_into().unwrap();
    assert!(normalized_reserves == 62644);

    // Governor withdraws reserves;
    let res = market
        .with_account(&admin)
        .await
        .unwrap()
        .withdraw_reserves(admin_account, normalized_reserves)
        .await;
    assert!(res.is_ok());

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // Check if reserves are withdrawn
    let new_reserves = market.get_reserves().await.unwrap().value;
    let normalized_reserves: u64 = convert_i256_to_i128(&new_reserves).try_into().unwrap();
    assert!(normalized_reserves == 0);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}

#[tokio::test]
async fn add_reserves_test() {
    let TestData {
        alice,
        alice_account,
        market,
        usdc,
        usdc_contract,
        ..
    } = setup(None).await;

    let mint_amount = parse_units(150, usdc.decimals);
    usdc_contract
        .mint(alice_account, mint_amount)
        .await
        .unwrap();

    let reserves = market.get_reserves().await.unwrap().value;
    let normalized_reserves: u64 = convert_i256_to_i128(&reserves).try_into().unwrap();
    assert!(normalized_reserves == 0);
    alice
        .force_transfer_to_contract(
            &market.contract_id(),
            mint_amount,
            usdc.asset_id,
            TxPolicies::default(),
        )
        .await
        .unwrap();
    let new_reserves = market.get_reserves().await.unwrap().value;
    let normalized_reserves: u64 = convert_i256_to_i128(&new_reserves).try_into().unwrap();
    assert!(normalized_reserves == mint_amount);
}
