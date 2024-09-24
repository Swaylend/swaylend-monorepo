library;

pub mod structs;

use pyth_interface::{data_structures::price::{Price, PriceFeedId}};
use structs::*;
use i256::I256;
use std::bytes::Bytes;

abi Market {
    // # 0. Activate contract (un-pause)
    #[storage(write)]
    fn activate_contract(market_configuration: MarketConfiguration);

    // # 1. Debug functionality (for testing purposes)
    // This functionality is exclusively utilized in local tests to evaluate interest accrual. 
    // It works by advancing the timestamp within the contract at specific intervals defined as `DEBUG_STEP`.
    #[storage(write)]
    fn debug_increment_timestamp();

    // # 2. Collateral asset management
    // This is an administrative function that allows the system's governor to set up new collateral assets. 
    // Each collateral assets may have different characteristics.
    #[storage(write)]
    fn add_collateral_asset(configuration: CollateralConfiguration);

    #[storage(write)]
    fn pause_collateral_asset(asset_id: AssetId);

    #[storage(write)]
    fn resume_collateral_asset(asset_id: AssetId);

    #[storage(write)]
    fn update_collateral_asset(asset_id: AssetId, configuration: CollateralConfiguration);    

    #[storage(read)]
    fn get_collateral_configurations() -> Vec<CollateralConfiguration>;

    // # 3. Collateral asset management (Supply and Withdrawal)
    // Users can deposit and withdraw collateral  (e.g., BTC, ETH, UNI...). This collateral is necessary to borrow.
    #[payable, storage(write)]
    fn supply_collateral(); // Payment is required: any collateral asset

    #[payable, storage(write)]
    fn withdraw_collateral(asset_id: AssetId, amount: u64, price_data_update: PriceDataUpdate);

    #[storage(read)]
    fn get_user_collateral(account: Identity, asset_id: AssetId) -> u64;

    #[storage(read)]
    fn get_all_user_collateral(account: Identity) -> Vec<(AssetId, u64)>;

    #[storage(read)]
    fn totals_collateral(asset_id: AssetId) -> u64;

    #[storage(read)]
    fn get_all_totals_collateral() -> Vec<(AssetId, u64)>;

    // # 4. Base asset management (Supply and Withdrawal)
    // If the user has enough collateral, `withdraw_base` performs the borrow function
    #[payable, storage(write)]
    fn supply_base(); // Payment is required: base asset (USDC)

    #[payable, storage(write)]
    fn withdraw_base(amount: u64, price_data_update: PriceDataUpdate);

    #[storage(read)]
    fn get_user_supply_borrow(account: Identity) -> (u256, u256); 

    #[storage(read)]
    fn available_to_borrow(account: Identity) -> u256;

    // # 5. Liquidation management
    // Liquidates the user if there is insufficient collateral for the borrowing. 
    #[payable, storage(write)]
    fn absorb(accounts: Vec<Identity>, price_data_update: PriceDataUpdate);

    #[storage(read)]
    fn is_liquidatable(account: Identity) -> bool;

    // # 6. Protocol collateral management
    #[payable, storage(read)]
    fn buy_collateral(asset_id: AssetId, min_amount: u64, recipient: Identity); // Payment is required: base asset (USDC)

    #[storage(read)]
    fn collateral_value_to_sell(asset_id: AssetId, collateral_amount: u64) -> u64;

    #[storage(read)]
    fn quote_collateral(asset_id: AssetId, base_amount: u64) -> u64;

    // ## 7. Reserves management
    #[storage(read)]
    fn get_reserves() -> I256;
    
    #[storage(read)]
    fn withdraw_reserves(to: Identity, amount: u64);

    #[storage(read)]
    fn get_collateral_reserves(asset_id: AssetId) -> I256;

    // # 8. Pause management
    #[storage(write)]
    fn pause(config: PauseConfiguration);

    // # 9. Getters
    #[storage(read)]
    fn get_market_configuration() -> MarketConfiguration;
    
    #[storage(read)]
    fn get_market_basics() -> MarketBasics;

    #[storage(read)]
    fn get_market_basics_with_interest() -> MarketBasics;

    #[storage(read)]
    fn get_user_basic(account: Identity) -> UserBasic;

    #[storage(read)]
    fn get_user_balance_with_interest(account: Identity) -> I256;

    #[storage(read)]
    fn get_utilization() -> u256;

    fn balance_of(asset_id: AssetId) -> u64;

    // Formulas to help calculate supply and borrow rates
    #[storage(read)]
    fn get_supply_rate(utilization: u256) -> u256;

    #[storage(read)]
    fn get_borrow_rate(utilization: u256) -> u256;

    // ## 10. Pyth calls
    #[storage(write)]
    fn set_pyth_contract_id(contract_id: ContractId);
    
    #[storage(read)]
    fn get_price(price_feed_id: PriceFeedId) -> Price;

    #[storage(read)]
    fn update_fee(update_data: Vec<Bytes>) -> u64;

    #[payable, storage(read)]
    fn update_price_feeds_if_necessary(price_data_update: PriceDataUpdate);
        
    // ## 11. Changing market configuration
    #[storage(write)]
    fn update_market_configuration(configuration: MarketConfiguration);
}
