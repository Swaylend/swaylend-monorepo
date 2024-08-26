use crate::utils::{setup, TestData};
use market::PriceDataUpdate;
use market_sdk::{convert_i256_to_i128, parse_units};
const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);

#[tokio::test]
async fn reserves_test() {
    let TestData {
        wallets,
        bob,
        bob_address,
        alice,
        alice_address,
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
        admin_address,
        ..
    } = setup().await;

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
            .mint(alice_address, alice_supply_amount)
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
        let res = market.get_user_basic(bob_address).await.unwrap();
        let principal_value: u64 = res.value.principal.value.try_into().unwrap();
        let repay_amount: u64 = principal_value + parse_units(10, usdc.decimals);

        usdc_contract.mint(bob_address, repay_amount).await.unwrap();
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
                eth.bits256,
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
    let normalized_reserves: u64 = convert_i256_to_i128(reserves).try_into().unwrap();
    assert!(normalized_reserves == 71628);

    // Governor withdraws reserves;
    let res = market
        .with_account(&admin)
        .await
        .unwrap()
        .withdraw_reserves(admin_address, normalized_reserves)
        .await;
    assert!(res.is_ok());

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // Check if reserves are withdrawn
    let new_reserves = market.get_reserves().await.unwrap().value;
    let normalized_reserves: u64 = convert_i256_to_i128(new_reserves).try_into().unwrap();
    assert!(normalized_reserves == 0);

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
}
