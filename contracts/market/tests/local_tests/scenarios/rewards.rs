use crate::utils::{setup, TestData};
use fuels::types::U256;
use market::PriceDataUpdate;
use market_sdk::parse_units;
const AMOUNT_COEFFICIENT: u64 = 10u64.pow(0);

#[tokio::test]
async fn rewards_test() {
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
        ..
    } = setup().await;

    let price_data_update = PriceDataUpdate {
        update_fee: 0,
        price_feed_ids,
        publish_times: vec![publish_time; assets.len()],
        update_data: oracle.create_update_data(&prices).await.unwrap(),
    };

    // Step 0: Alice supplies 5000 USDC
    let alice_supply_amount = parse_units(5000 * AMOUNT_COEFFICIENT, usdc.decimals);
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
    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();
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

    // Step 2: Bob borrows 3000 USDC
    let borrow_amount = parse_units(3000 * AMOUNT_COEFFICIENT, usdc.decimals);
    let res = market
        .with_account(&bob)
        .await
        .unwrap()
        .withdraw_base(&[&oracle.instance], borrow_amount, &price_data_update)
        .await;
    assert!(res.is_ok(), "{:?}", res.err());
    market.debug_increment_timestamp().await.unwrap();

    market
        .print_debug_state(&wallets, &usdc, &eth)
        .await
        .unwrap();

    // Step 3: Bob repays 4000 USDC
    let repay_amount = parse_units(4000 * AMOUNT_COEFFICIENT, usdc.decimals);
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
    assert!(res.is_ok());
    market.debug_increment_timestamp().await.unwrap();

    // Step 5: Alice supplies additional 500 USDC
    let alice_supply_amount = parse_units(500 * AMOUNT_COEFFICIENT, usdc.decimals);
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

    let alice_user_basic = market.get_user_basic(alice_address).await.unwrap().value;
    println!("Alice user basic: {:?}", alice_user_basic);
    let alice_supply_rewards = alice_user_basic.base_tracking_accrued;
    assert!(alice_supply_rewards > U256::zero());

    let bob_user_basic = market.get_user_basic(bob_address).await.unwrap().value;
    println!("Bob user basic: {:?}", bob_user_basic);
    let bob_borrow_rewards = bob_user_basic.base_tracking_accrued;
    assert!(bob_borrow_rewards > U256::zero());
}
