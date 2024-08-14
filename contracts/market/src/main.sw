// SPDX-License-Identifier: BUSL-1.1
contract;

//
// @title Swaylend's Market Contract
// @notice An efficient monolithic money market protocol
// @author
//

mod events;

use events::*;

use pyth_interface::{data_structures::price::{Price, PriceFeedId}, PythCore};
use market_abi::{Market, structs::*,};
use i256::I256;
use std::asset::{mint_to, transfer};
use std::auth::{AuthError, msg_sender};
use std::call_frames::msg_asset_id;
use std::contract_id::ContractId;
use std::constants::ZERO_B256;
use std::context::{msg_amount, this_balance};
use std::hash::{Hash, sha256};
use std::logging::log;
use std::revert::require;
use std::storage::storage_vec::*;
use std::u128::U128;
use std::vec::Vec;
use std::bytes::Bytes;

// This is set during deployment of the contract
configurable {
    DEBUG_STEP: u64 = 0,
    FUEL_ETH_BASE_ASSET_ID: b256 = 0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07,
}

storage {
    // market configuration
    market_configuration: MarketConfiguration = MarketConfiguration::default(),
    // configuration for collateral assets (can add, pause ...)
    collateral_configurations: StorageMap<b256, CollateralConfiguration> = StorageMap {},
    // list of asset ids of collateral assets
    collateral_configurations_keys: StorageVec<b256> = StorageVec {},
    // booleans to pause certain functionalities
    pause_config: PauseConfiguration = PauseConfiguration::default(),
    // total collateral for each asset
    totals_collateral: StorageMap<b256, u256> = StorageMap {},
    // how much collateral user provided (separate for each asset)
    user_collateral: StorageMap<(Address, b256), u256> = StorageMap {},
    // holds information about the users details in the market
    user_basic: StorageMap<Address, UserBasic> = StorageMap {},
    // information about the whole market (total supply, total borrow, etc.)
    market_basic: MarketBasics = MarketBasics::default(),
    // debug timestamp (for testing purposes)
    debug_timestamp: u64 = 0,
    // pyth contract id
    pyth_contract_id: b256 = ZERO_B256,
}

// Market contract implementation
impl Market for Contract {
    // # 0. Activate contract
    #[storage(read, write)]
    fn activate_contract(market_configuration: MarketConfiguration) {
        // No need to do this check
        // require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);
        require(storage.market_basic.last_accrual_time.read() == 0, Error::AlreadyActive);

        // Set market configuration
        storage.market_configuration.write(market_configuration);

        // Set last_accrual_time to current timestamp
        storage.market_basic.last_accrual_time.write(timestamp().into());

        let market_basic = storage.market_basic.read();

        // Emit market basic event
        log(MarketBasicEvent {
            market_basic,
        });

        let pause_config = PauseConfiguration {
            supply_paused: false,
            withdraw_paused: false,
            absorb_paused: false,
            buy_paused: false,
        };

        // Un-pause the contract
        storage.pause_config.write(pause_config);
        
        // Emit pause configuration updated event
        log(PauseConfigurationEvent {
            pause_config,
        });

        // Emit market configuration event
        log(MarketConfigurationEvent {
            market_config: market_configuration,
        });
    }

    // # 1. Debug functionality (for testing purposes)

    // ## 1.1 Manually increment timestamp
    #[storage(read, write)]
    fn debug_increment_timestamp() {
        require(DEBUG_STEP > 0, Error::DebuggingDisabled);

        storage
            .debug_timestamp
            .write(storage.debug_timestamp.read() + DEBUG_STEP);
    }

    // # 2. Collateral asset management

    // ## 2.1 Add new collateral asset
    // ### Parameters:
    // - `configuration`: The collateral configuration to be added
    #[storage(write, read)]
    fn add_collateral_asset(configuration: CollateralConfiguration) {
        // Only governor can add new collateral asset
        require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);
        // Check if asset already exists
        require(
            storage
                .collateral_configurations
                .get(configuration.asset_id)
                .try_read()
                .is_none(),
            Error::UnknownAsset,
        );

        storage
            .collateral_configurations
            .insert(configuration.asset_id, configuration);
        storage
            .collateral_configurations_keys
            .push(configuration.asset_id);

        log(CollateralAssetAdded { asset_id: configuration.asset_id, configuration });
    }

    // ## 2.2 Pause an existing collateral asset
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset to be paused
    #[storage(read, write)]
    fn pause_collateral_asset(asset_id: b256) {
        // Only governor can pause collateral asset
        require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);

        let mut configuration = storage.collateral_configurations.get(asset_id).read();
        configuration.paused = true;
        storage
            .collateral_configurations
            .insert(asset_id, configuration);

        log(CollateralAssetPaused{ asset_id: configuration.asset_id });
    }

    // ## 2.3 Resume a paused collateral asset
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset to be resumed
    #[storage(read, write)]
    fn resume_collateral_asset(asset_id: b256) {
        // only governor can resume collateral asset
        require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);

        let mut configuration = storage.collateral_configurations.get(asset_id).read();
        configuration.paused = false;
        storage
            .collateral_configurations
            .insert(asset_id, configuration);

        log(CollateralAssetResumed { asset_id: configuration.asset_id });
    }

    // ## 2.4 Update an existing collateral asset configuration
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset to be updated
    // - `configuration`: The new collateral configuration
    #[storage(read, write)]
    fn update_collateral_asset(asset_id: b256, configuration: CollateralConfiguration) {
        // Only governor can update collateral asset
        require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);
        // Check if asset exists
        require(
            storage
                .collateral_configurations
                .get(asset_id)
                .try_read()
                .is_some(),
            Error::UnknownAsset,
        );

        storage
            .collateral_configurations
            .insert(asset_id, configuration);

        log(CollateralAssetUpdated { asset_id, configuration });
    }

    // ## 2.5 Get all collateral asset configurations
    // ### Returns:
    // - `Vec<CollateralConfiguration>`: A list of collateral configurations
    #[storage(read)]
    fn get_collateral_configurations() -> Vec<CollateralConfiguration> {
        let mut result = Vec::new();
        let mut index = 0;

        while index < storage.collateral_configurations_keys.len() {
            let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();
            result.push(collateral_configuration);
            index += 1;
        }

        result
    }

    // # 3. Collateral asset management (Supply and Withdrawal)

    // ## 3.1 Supply Collateral
    #[payable, storage(read, write)]
    fn supply_collateral() {
        // Only allow supplying collateral if paused flag is not set
        require(!storage.pause_config.supply_paused.read(), Error::Paused);

        // Check that the amount is greater than 0
        let amount: u256 = msg_amount().into();
        require(amount > 0, Error::InvalidPayment);

        // Get the asset ID of the collateral asset being supplied and check that it is not paused
        let asset_id: b256 = msg_asset_id().into();
        let collateral_configuration = storage.collateral_configurations.get(asset_id).read();
        require(!collateral_configuration.paused, Error::Paused);

        // Check that the new total collateral does not exceed the supply cap
        let total_collateral = storage.totals_collateral.get(asset_id).try_read().unwrap_or(0) + amount;
        require(
                collateral_configuration
                .supply_cap >= total_collateral,
            Error::SupplyCapExceeded,
        );

        // Get the caller's address and calculate the new user collateral
        let caller = msg_sender_address();
        let user_collateral = storage.user_collateral.get((caller, asset_id)).try_read().unwrap_or(0) + amount;

        // Update the storage values (total collateral, user collateral)
        storage.totals_collateral.insert(asset_id, total_collateral);
        storage
            .user_collateral
            .insert((caller, asset_id), user_collateral);

        // Log user supply collateral event
        log(UserSupplyCollateralEvent {
            address: caller,
            asset_id,
            amount: amount,
        });
    }

    // ## 3.2 Withdraw Collateral
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset to be withdrawn
    // - `amount`: The amount of collateral to be withdrawn
    // - `price_data_update`: The price data update struct to be used for updating the price feeds
    #[payable, storage(read, write)]
    fn withdraw_collateral(asset_id: b256, amount: u256, price_data_update: PriceDataUpdate) {
        // Get the caller's address and calculate the new user and total collateral
        let caller = msg_sender_address();
        let user_collateral = storage.user_collateral.get((caller, asset_id)).try_read().unwrap_or(0) - amount;
        let total_collateral = storage.totals_collateral.get(asset_id).try_read().unwrap_or(0) - amount;

        // Update the storage values (total collateral, user collateral)
        storage.totals_collateral.insert(asset_id, total_collateral);
        storage
            .user_collateral
            .insert((caller, asset_id), user_collateral);

        // Update price data
        update_price_feeds_if_necessary_internal(price_data_update);

        // Note: no accrue interest, BorrowCollateralFactor < LiquidationCollateralFactor covers small changes
        // Check if the user is borrow collateralized
        require(is_borrow_collateralized(caller), Error::NotCollateralized);

        transfer(Identity::Address(caller), AssetId::from(asset_id), <u64 as TryFrom<u256>>::try_from(amount).unwrap());

        // Log user withdraw collateral event
        log(UserWithdrawCollateralEvent {
            address: caller,
            asset_id,
            amount: amount,
        });
    }

    // ## 3.3 Get User Collateral
    // ### Parameters:
    // - `address`: The address of the user
    // - `asset_id`: The asset ID of the collateral asset
    #[storage(read)]
    fn get_user_collateral(address: Address, asset_id: b256) -> u256 {
        storage.user_collateral.get((address, asset_id)).try_read().unwrap_or(0)
    }

    // ## 3.4 Get Total Collateral
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset
    #[storage(read)]
    fn totals_collateral(asset_id: b256) -> u256 {
        storage.totals_collateral.get(asset_id).try_read().unwrap_or(0)
    }

    // # 4. Base asset management (Supply and Withdrawal)

    // ## 4.1 Supply Base
    #[payable, storage(read, write)]
    fn supply_base() {
        // Only allow supplying if paused flag is not set
        require(!storage.pause_config.supply_paused.read(), Error::Paused);

        // // Check that the amount is greater than 0 and that supplied asset is the base asset
        let amount = msg_amount();
        let base_asset_id = storage.market_configuration.read().base_token;
        require(
            amount > 0 && msg_asset_id()
                .bits() == base_asset_id,
            Error::InvalidPayment,
        );

        // Accrue interest
        accrue_internal();

        // Get caller's user basic state
        let caller = msg_sender_address();
        let user_basic = storage.user_basic.get(caller).try_read().unwrap_or(UserBasic::default());
        let user_principal = user_basic.principal;

        // Calculate new balance and principal value
        let user_balance = present_value(user_principal) + I256::from(amount);
        let user_principal_new = principal_value(user_balance);

        // Calculate repay and supply amounts
        let (repay_amount, supply_amount) = repay_and_supply_amount(user_principal, user_principal_new);
       
        // Read and update market basic information
        let mut market_basic = storage.market_basic.read();
        market_basic.total_supply_base += supply_amount;
        market_basic.total_borrow_base -= repay_amount;

        // Write to storage (market_basic)
        storage.market_basic.write(market_basic);

        // Update and write principal to storage
        update_base_principal(caller, user_basic, user_principal_new);

        // Emit user supply base event
        log(UserSupplyBaseEvent {
            address: caller,
            supply_amount,
            repay_amount,
        });

        // Emit market basic event
        log(MarketBasicEvent {
            market_basic,
        });
    }

    // ## 4.2 Withdraw base (borrowing if possible/necessary)
    // ### Parameters:
    // - `amount`: The amount of base asset to be withdrawn
    // - `price_data_update`: The price data update struct to be used for updating the price feeds
    #[payable, storage(read, write)]
    fn withdraw_base(amount: u256, price_data_update: PriceDataUpdate) {
        // Only allow withdrawing if paused flag is not set
        require(!storage.pause_config.withdraw_paused.read(), Error::Paused);

        // Check that the amount is greater than 0
        require(amount > 0, Error::InvalidPayment);

        // Accrue interest
        accrue_internal();

        // Get caller's user basic state
        let caller = msg_sender_address();
        let user_basic = storage.user_basic.get(caller).try_read().unwrap_or(UserBasic::default());
        let user_principal = user_basic.principal;

        // Calculate new balance and principal value
        let user_balance = present_value(user_principal) - I256::from(amount);
        let user_principal_new = principal_value(user_balance);

        // Calculate withdraw and borrow amounts
        let (withdraw_amount, borrow_amount) = withdraw_and_borrow_amount(user_principal, user_principal_new);

        log(UserWithdrawBaseEvent {
            address: caller,
            withdraw_amount,
            borrow_amount,
        });

        // Read and update market basic information
        let mut market_basic = storage.market_basic.read();
        market_basic.total_supply_base -= withdraw_amount;
        market_basic.total_borrow_base += borrow_amount;

        // Write to storage (market_basic)
        storage.market_basic.write(market_basic);

        // Emit market basic event
        log(MarketBasicEvent {
            market_basic,
        });

        // Update and write principal to storage
        update_base_principal(caller, user_basic, user_principal_new);

        if user_balance.negative {
            // Check that the borrow amount is greater than the minimum allowed
            require(
                user_balance.flip().value >= storage.market_configuration.read().base_borrow_min,
                Error::BorrowTooSmall,
            );

            // Update price data
            update_price_feeds_if_necessary_internal(price_data_update);

            // Check that the user is borrow collateralized
            require(is_borrow_collateralized(caller), Error::NotCollateralized);
        }

        // Transfer base asset to the caller
        transfer(Identity::Address(caller), AssetId::from(storage.market_configuration.read().base_token), <u64 as TryFrom<u256>>::try_from(amount).unwrap());
    }

    // ## 4.3 Get user supply and borrow
    // ### Parameters:
    // - `account`: The address of the user
    // ### Returns:
    // - `supply`: The amount of base asset supplied by the user
    // - `borrow`: The amount of base asset borrowed by the user
    #[storage(read)]
    fn get_user_supply_borrow(account: Address) -> (u256, u256) {
        get_user_supply_borrow_internal(account)
    }

    // ## 4.4 Get how much user can borrow
    // ### Parameters:
    // - `account`: The address of the user
    // ### Returns:
    // - `borrow`: The amount of base asset the user can borrow
    #[storage(read)]
    fn available_to_borrow(account: Address) -> u256 {
        // Get user's supply and borrow
        let (_, borrow) = get_user_supply_borrow_internal(account);

        let mut borrow_limit: u256 = 0;
        
        // Calculate borrow limit for each collateral asset the user has
        let mut index = 0;
        while index < storage.collateral_configurations_keys.len() {
            let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();

            let balance = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0);
            
            let price = get_price_internal(
                collateral_configuration
                    .price_feed_id,
            ); // decimals: price.exponent
            let price_exponent = price.exponent;
            let price = u256::from(price.price); // decimals: price.exponent

            let amount = balance * collateral_configuration.borrow_collateral_factor / FACTOR_SCALE_18; // decimals: collateral_configuration.decimals
            let scale = u256::from(10_u64).pow(collateral_configuration.decimals + price_exponent - storage.market_configuration.read().base_token_decimals);

            borrow_limit += amount * price / scale; // decimals: base_token_decimals
            index += 1;
        };

        if borrow_limit < borrow {
            u256::zero()
        } else {
            // Returns how much the user can borrow
            borrow_limit - borrow
        }
    }

    // # 5. Liquidation management

    // ## 5.1 Absorb
    // ### Description:
    // - Absorb a list of underwater accounts onto the protocol balance sheet
    // ### Parameters:
    // - `accounts`: The list of underwater accounts to be absorbed
    #[payable, storage(read, write)]
    fn absorb(accounts: Vec<Address>, price_data_update: PriceDataUpdate) {
        // Check that the pause flag is not set
        require(!storage.pause_config.absorb_paused.read(), Error::Paused);

        // Accrue interest
        accrue_internal();

        // Update price data
        update_price_feeds_if_necessary_internal(price_data_update);

        let mut index = 0;
        // Loop and absorb each account
        while index < accounts.len() {
            absorb_internal(accounts.get(index).unwrap());
            index += 1;
        }
    }

    // ## 5.2 Is liquidatable
    // ### Description:
    // - Check if an account is liquidatable
    // ### Parameters:
    // - `account`: The address of the account to be checked
    // ### Returns:
    // - `bool`: True if the account is liquidatable, False otherwise
    #[storage(read)]
    fn is_liquidatable(account: Address) -> bool {
        is_liquidatable_internal(account)
    }

    // # 6. Protocol collateral management

    // ## 6.1 Buying collateral
    // ### Description:
    // - Buy collateral from the protocol
    // - Prices are not updated here as it is expected that the caller updates them in the same transaction by using a multicall handler
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset to be bought
    // - `min_amount`: The minimum amount of collateral to be bought
    // - `recipient`: The address of the recipient of the collateral
    #[payable, storage(read)]
    fn buy_collateral(asset_id: b256, min_amount: u256, recipient: Address) {
        // Only allow buying collateral if paused flag is not set
        require(!storage.pause_config.buy_paused.read(), Error::Paused);
        let payment_amount: u256 = msg_amount().into();

        // Only allow payment in the base token and check that the payment amount is greater than 0
        require(
            msg_asset_id()
                .bits() == storage.market_configuration.read().base_token && payment_amount > 0,
            Error::InvalidPayment,
        );

        let reserves = get_reserves_internal();

        // Only allow purchases if reserves are negative or if the reserves are less than the target reserves
        require(
            reserves < I256::zero() || reserves.value < storage.market_configuration.read().target_reserves,
            Error::NotForSale,
        );

        // TODO[Martin]: Checkout what these 2 notes do/mean and if we need a re-entrancy guard
        // Note: Re-entrancy can skip the reserves check above on a second buyCollateral call.
        let reserves = get_collateral_reserves_internal(asset_id);

        // Calculate the quote for a collateral asset in exchange for an amount of the base asset
        let collateral_amount = quote_collateral_internal(asset_id, payment_amount);

        // Check that the quote is greater than or equal to the minimum requested amount
        require(collateral_amount >= min_amount, Error::TooMuchSlippage);

        // Check that the quote is less than or equal to the reserves
        require(
            I256::from(collateral_amount) <= reserves,
            Error::InsufficientReserves,
        );

        // Note: Pre-transfer hook can re-enter buyCollateral with a stale collateral ERC20 balance.
        // Assets should not be listed which allow re-entry from pre-transfer now, as too much collateral could be bought.
        // This is also a problem if quoteCollateral derives its discount from the collateral ERC20 balance.

        let caller = msg_sender_address();

        // Emit buy collateral event
        log(BuyCollateralEvent {
            caller,
            recipient,
            asset_id,
            amount: collateral_amount,
            price: payment_amount,
        });

        // Transfer the collateral asset to the recipient
        transfer(
            Identity::Address(recipient),
            AssetId::from(asset_id),
            <u64 as TryFrom<u256>>::try_from(collateral_amount).unwrap()
        );
    }

    // Get base asset value for selling a collateral asset
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset
    // - `collateral_amount`: The amount of collateral asset
    // ### Returns:
    // - `value`: The value of the collateral asset in base asset
    #[storage(read)]
    fn collateral_value_to_sell(asset_id: b256, collateral_amount: u256) -> u256 { // decimals: base_token_decimals
        let collateral_configuration = storage.collateral_configurations.get(asset_id).read();

        // Get the collateral asset price
        let asset_price = get_price_internal(collateral_configuration.price_feed_id); // decimals: asset_price.exponent
        let asset_price_scale = u256::from(10_u64).pow(asset_price.exponent);
        let asset_price = u256::from(asset_price.price); // decimals: asset_price.exponent

        let discount_factor: u256 = storage.market_configuration.read().store_front_price_factor * (FACTOR_SCALE_18 - collateral_configuration.liquidation_penalty) / FACTOR_SCALE_18; // decimals: 18

        let asset_price_discounted: u256 = asset_price * (FACTOR_SCALE_18 - discount_factor) / FACTOR_SCALE_18; // decimals: asset_price.exponent

        // Get the base token price 
        let base_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id); // decimals: base_price.exponent
        let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
        let base_price = u256::from(base_price.price); // decimals: base_price.exponent

        let scale = u256::from(10_u64).pow(collateral_configuration.decimals - storage.market_configuration.read().base_token_decimals);

        asset_price_discounted * collateral_amount * base_price_scale / asset_price_scale / base_price / scale
    }

    // ## 6.3 Get collateral quote for an amount of base asset
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset
    // - `base_amount`: The amount of base asset
    // ### Returns:
    // - `quote`: The quote for the collateral asset in exchange for the base asset (asset decimals)
    #[storage(read)]
    fn quote_collateral(asset_id: b256, base_amount: u256) -> u256 {
        quote_collateral_internal(asset_id, base_amount)
    }

    // ## 7. Reserves management

    // ## 7.1 Get reserves
    // ### Returns:
    // - `reserves`: The reserves (base_token_decimals)
    #[storage(read)]
    fn get_reserves() -> I256 {
        get_reserves_internal()
    }

    // ## 7.2 Withdraw reserves
    // ### Parameters:
    // - `to`: The address to which the reserves will be sent
    // - `amount`: The amount of reserves to be withdrawn
    #[storage(read)]
    fn withdraw_reserves(to: Address, amount: u256) {
        let caller = msg_sender_address();

        // Only governor can withdraw reserves
        require(caller == storage.market_configuration.read().governor, Error::Unauthorized);
        let reserves = get_reserves_internal();

        // Check that the reserves are greater than 0 and that the amount is less than or equal to the reserves
        require(
            reserves >= I256::zero() && reserves.value >= amount,
            Error::InsufficientReserves,
        );

        // Emit reserves withdrawn event
        log(ReservesWithdrawnEvent {
            address: caller,
            amount: amount,
        });

        // Transfer the reserves to the recipient
        transfer(Identity::Address(to), AssetId::from(storage.market_configuration.read().base_token), <u64 as TryFrom<u256>>::try_from(amount).unwrap())
    }

    // ## 7.3 Get the collateral reserves of an asset
    // ### Parameters:
    // - `asset_id`: The asset ID of the collateral asset
    // ### Returns:
    // - `reserves`: The reserves (asset decimals)
    #[storage(read)]
    fn get_collateral_reserves(asset_id: b256) -> I256 {
        get_collateral_reserves_internal(asset_id)
    }

    // # 8. Pause management

    // ## 8.1 Pause
    // ### Description:
    // - Update the pause configuration of the contract
    // ### Parameters:
    // - `pause_config`: The pause configuration to be set
    #[storage(write, read)]
    fn pause(pause_config: PauseConfiguration) {
        let caller = msg_sender_address();
        require(
            caller == storage.market_configuration.read().governor || caller == storage.market_configuration.read().pause_guardian,
            Error::Unauthorized,
        );

        // Emit pause configuration updated event
        log(PauseConfigurationEvent {
            pause_config,
        });

        storage.pause_config.write(pause_config);
    }

    // # 9. Getters

    // ## 9.1 Get market configuration
    // ### Returns:
    // - `MarketConfiguration`: The market configuration
    #[storage(read)]
    fn get_market_configuration() -> MarketConfiguration {
        storage.market_configuration.read()
    }

    // ## 9.2 Get market basics
    // ### Returns:
    // - `MarketBasics`: The market basic information
    #[storage(read)]
    fn get_market_basics() -> MarketBasics {
        storage.market_basic.read()
    }

    // ## 9.3 Get user basic
    // ### Parameters:
    // - `account`: The address of the user
    // ### Returns:
    // - `UserBasic`: The user basic information
    #[storage(read)]
    fn get_user_basic(account: Address) -> UserBasic {
        storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default())
    }

    // ## 9.4 Get utilization
    // ### Returns:
    // - `u256`: The utilization of the market
    #[storage(read)]
    fn get_utilization() -> u256 {
        get_utilization_internal()
    }

    // ## 9.5 Get balance of an asset
    fn balance_of(asset: b256) -> u64 {
        this_balance(AssetId::from(asset))
    }

    // ## 9.6 Get supply rate for a given utilization
    // ### Parameters:
    // - `utilization`: The utilization of the market
    // ### Returns:
    // - `u256`: The supply rate
    #[storage(read)]
    fn get_supply_rate(utilization: u256) -> u256 {
        get_supply_rate_internal(utilization)
    }

    // ## 9.7 Get borrow rate for a given utilization
    // ### Parameters:
    // - `utilization`: The utilization of the market
    // ### Returns:
    // - `u256`: The borrow rate
    #[storage(read)]
    fn get_borrow_rate(utilization: u256) -> u256 {
        get_borrow_rate_internal(utilization)
    }

    // # 10. Pyth Oracle management
    #[storage(read, write)]
    fn set_pyth_contract_id(contract_id: ContractId) {
        // Only governor can set the Pyth contract ID
        require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);
        storage.pyth_contract_id.write(contract_id.into());
    }

    #[storage(read)]
    fn get_price(price_feed_id: PriceFeedId) -> Price {
        get_price_internal(price_feed_id)
    }

    #[storage(read)]
    fn update_fee(update_data: Vec<Bytes>) -> u64 {
        update_fee_internal(update_data)
    }

    #[payable, storage(read)]
    fn update_price_feeds_if_necessary(price_data_update: PriceDataUpdate) {
        update_price_feeds_if_necessary_internal(price_data_update)
    }

    // # 11. Changing market configuration
    #[storage(read, write)]
    fn update_market_configuration(configuration: MarketConfiguration) {
        // Only governor can update the market configuration
        require(msg_sender_address() == storage.market_configuration.read().governor, Error::Unauthorized);

        let mut configuration = configuration;

        // Cannot change base token and tracking index scale
        configuration.base_token = storage.market_configuration.read().base_token;
        configuration.base_tracking_index_scale = storage.market_configuration.read().base_tracking_index_scale;

        // Update the market configuration
        storage.market_configuration.write(configuration);

        // Emit market configuration event  
        log(MarketConfigurationEvent {
            market_config: configuration,
        });
    }
}

// # 10. Pyth Oracle management
#[storage(read)]
fn get_price_internal(price_feed_id: PriceFeedId) -> Price {
    let contract_id = storage.pyth_contract_id.read();
    require(contract_id != ZERO_B256, Error::OracleContractIdNotSet);
        
    let oracle = abi(PythCore, contract_id);
    let price = oracle.price(price_feed_id);
    price
}

#[storage(read)]
fn update_fee_internal(update_data: Vec<Bytes>) -> u64 {
    let contract_id = storage.pyth_contract_id.read();
    require(contract_id != ZERO_B256, Error::OracleContractIdNotSet);

    let oracle = abi(PythCore,contract_id);
    let fee = oracle.update_fee(update_data);
    fee
}

#[payable, storage(read)]
fn update_price_feeds_if_necessary_internal(price_data_update: PriceDataUpdate) {
    let contract_id = storage.pyth_contract_id.read();
    require(contract_id != ZERO_B256, Error::OracleContractIdNotSet);

    let oracle = abi(PythCore, contract_id);
    oracle.update_price_feeds_if_necessary {
        asset_id: FUEL_ETH_BASE_ASSET_ID, coins: price_data_update.update_fee
    }
    (price_data_update.price_feed_ids, price_data_update.publish_times, price_data_update.update_data);
}
   

// ## Timestamp getter
// ### Description:
// - Returns the current timestamp or the timestamp of the last debug step if debugging is enabled
#[storage(read)]
fn timestamp() -> u64 {
    if DEBUG_STEP > 0 {
        storage.debug_timestamp.read()
    } else {
        std::block::timestamp()
    }
}

// ## Get the message sender's address
// ### Description:
// - Returns the message sender's address, reverting if the message sender is a contract
fn msg_sender_address() -> Address {
    match msg_sender().unwrap() {
        Identity::Address(identity) => identity,
        _ => revert(0),
    }
}

// ## Calculate present supply value
// ### Parameters:
// - `base_supply_index`: The base supply index
// - `principal`: The principal value
// ### Returns:
// - `present_value`: The present value (base_token_decimals)
pub fn present_value_supply(base_supply_index: u256, principal: u256) -> u256 {
    principal * base_supply_index / BASE_INDEX_SCALE_15
}

// ## Calculate present borrow value
// ### Parameters:
// - `base_borrow_index`: The base borrow index
// - `principal`: The principal value
// ### Returns:
// - `present_value`: The present value (base_token_decimals)
pub fn present_value_borrow(base_borrow_index: u256, principal: u256) -> u256 {
    principal * base_borrow_index / BASE_INDEX_SCALE_15
}

// ## Calculate principal supply value
// ### Parameters:
// - `base_supply_index`: The base supply index
// - `present`: The present value
// ### Returns:
// - `principal_value`: The principal value (base_token_decimals)
pub fn principal_value_supply(base_supply_index: u256, present: u256) -> u256 {
    present * BASE_INDEX_SCALE_15 / base_supply_index
}

// ## Calculate principal borrow value
// ### Parameters:
// - `base_borrow_index`: The base borrow index
// - `present`: The present value
// ### Returns:
// - `principal_value`: The principal value (base_token_decimals)
pub fn principal_value_borrow(base_borrow_index: u256, present: u256) -> u256 {
    (present * BASE_INDEX_SCALE_15 + base_borrow_index - 1) / base_borrow_index
}

// ## Calculate present value
// ### Description:
// -  The positive present supply balance if positive or the negative borrow balance if negative
// ### Parameters:
// - `principal`: The principal value
// ### Returns:
// - `present_value`: The present value (base_token_decimals)
#[storage(read)]
fn present_value(principal: I256) -> I256 {
    let market_basic = storage.market_basic.read();
    if principal >= I256::zero() {
        let present_value = present_value_supply(market_basic.base_supply_index, principal.into());
        I256::from(present_value)
    } else {
        let present_value = present_value_borrow(market_basic.base_borrow_index, principal.flip().into());
        I256::from(present_value).flip()
    }
}

// ## Calculate principal value
// ### Parameters:
// - `present_value`: The present value
// ### Returns:
// - `principal_value`: The principal value (base_token_decimals)
#[storage(read)]
fn principal_value(present_value: I256) -> I256 {
    let market_basic = storage.market_basic.read();
    if present_value >= I256::zero() {
        let principal_value = principal_value_supply(market_basic.base_supply_index, present_value.into());
        I256::from(principal_value)
    } else {
        let principal_value = principal_value_borrow(market_basic.base_borrow_index, present_value.flip().into());
        I256::from(principal_value).flip()
    }
}

// ## Calculate utilization
// ### Description:
// - Calculate the utilization of the market
// ### Returns:
// - `utilization`: The utilization of the market (decimals 18)
#[storage(read)]
fn get_utilization_internal() -> u256 {
    let market_basic = storage.market_basic.read();
    let total_supply_base = present_value_supply(market_basic.base_supply_index, market_basic.total_supply_base);
    let total_borrow_base = present_value_borrow(market_basic.base_borrow_index, market_basic.total_borrow_base);

    if total_supply_base == u256::zero() {
        u256::zero()
    } else {
        total_borrow_base * FACTOR_SCALE_18 / total_supply_base
   }
}

// ## Calculate the supply rate
// ### Parameters:
// - `utilization`: The utilization of the market
// ### Returns:
// - `supply_rate`: The supply rate (decimals 18)
#[storage(read)]
fn get_supply_rate_internal(utilization: u256) -> u256 {
    if utilization <= storage.market_configuration.read().supply_kink {
        storage.market_configuration.read().supply_per_second_interest_rate_base + storage.market_configuration.read().supply_per_second_interest_rate_slope_low * utilization / FACTOR_SCALE_18
    } else {
        storage.market_configuration.read().supply_per_second_interest_rate_base + (storage.market_configuration.read().supply_per_second_interest_rate_slope_low * storage.market_configuration.read().supply_kink / FACTOR_SCALE_18) + (storage.market_configuration.read().supply_per_second_interest_rate_slope_high * (utilization - storage.market_configuration.read().supply_kink) / FACTOR_SCALE_18)
    }
}

// ## Calculate the borrow rate
// ### Parameters:
// - `utilization`: The utilization of the market
// ### Returns:
// - `borrow_rate`: The borrow rate (decimals 18)
#[storage(read)]
fn get_borrow_rate_internal(utilization: u256) -> u256 {
    if utilization <= storage.market_configuration.read().borrow_kink {
        storage.market_configuration.read().borrow_per_second_interest_rate_base + storage.market_configuration.read().borrow_per_second_interest_rate_slope_low * utilization / FACTOR_SCALE_18
    } else {
        storage.market_configuration.read().borrow_per_second_interest_rate_base + (storage.market_configuration.read().borrow_per_second_interest_rate_slope_low * storage.market_configuration.read().borrow_kink / FACTOR_SCALE_18) + (storage.market_configuration.read().borrow_per_second_interest_rate_slope_high * (utilization - storage.market_configuration.read().borrow_kink) / FACTOR_SCALE_18)
    }
}

// ## Calculate user's supply and borrow amounts
// ### Parameters:
// - `account`: The address of the user
// ### Returns:
// - `supply`: The amount of base asset supplied by the user
// - `borrow`: The amount of base asset borrowed by the user
#[storage(read)]
fn get_user_supply_borrow_internal(account: Address) -> (u256, u256) {
    let principal = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default()).principal;
    let last_accrual_time = storage.market_basic.last_accrual_time.read();
    let (supply_index, borrow_index) = accrued_interest_indices(timestamp().into(), last_accrual_time);
    if !principal.negative {
        let supply = present_value_supply(supply_index, principal.into());
        (supply, 0)
    } else {
        let borrow = present_value_borrow(borrow_index, principal.flip().into());
        (0, borrow)
    }
}

// ## Calculate accrued interest indices for base token supply and borrows
// ### Parameters:
// - `now`: The current timestamp
// - `last_accrual_time`: The timestamp of the last accrual
// ### Returns:
// - `base_supply_index`: The updated base token supply index (18 decimals)
// - `base_borrow_index`: The updated base token borrow index (18 decimals)
#[storage(read)]
fn accrued_interest_indices(now: u256, last_accrual_time: u256) -> (u256, u256) {
    if last_accrual_time == 0 {
        return (BASE_INDEX_SCALE_15, BASE_INDEX_SCALE_15);
    }

    // Market basics
    let market_basic = storage.market_basic.read();
    let mut base_supply_index = market_basic.base_supply_index; // decimals 18
    let mut base_borrow_index = market_basic.base_borrow_index; // decimals 18

    // Calculate time elapsed since last accrual
    let time_elapsed = now - last_accrual_time;
    if time_elapsed > 0 {
        let utilization = get_utilization_internal(); // decimals 18
        let supply_rate = get_supply_rate_internal(utilization); // decimals 18
        let borrow_rate = get_borrow_rate_internal(utilization); // decimals 18

        // Calculate new base indices
        let base_supply_index_delta = base_supply_index * supply_rate * time_elapsed / FACTOR_SCALE_18;
        let base_borrow_index_delta = base_borrow_index * borrow_rate * time_elapsed / FACTOR_SCALE_18;

        base_supply_index += base_supply_index_delta;
        base_borrow_index += base_borrow_index_delta;
    }

    return (base_supply_index, base_borrow_index);
}

// Checks that the dollar value of the user's collateral multiplied by borrow_collateral_factor is greater than the (planned) loan amount.
#[storage(read)]
fn is_borrow_collateralized(account: Address) -> bool {
    let principal = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default()).principal; // decimals: base_asset_decimal
    
    if !principal.negative {
        return true
    };

    let present = present_value(principal); // decimals: base_token_decimals

    let mut borrow_limit: u256 = 0;

    let mut index = 0;
    while index < storage.collateral_configurations_keys.len() {
        let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();

        let balance = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0); // decimals: collateral_configuration.decimals

        let price = get_price_internal(
            collateral_configuration
                .price_feed_id,
        ); // decimals: price.exponent decimals
        let price_scale = u256::from(10_u64).pow(price.exponent);
        let price = u256::from(price.price); // decimals: price.exponent

        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
        let base_scale = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals);

        let amount = balance * price / price_scale; // decimals: collateral_configuration.decimals
        borrow_limit += amount * collateral_configuration.borrow_collateral_factor * base_scale / FACTOR_SCALE_18 / collateral_scale; // decimals: base_token_decimals

        index += 1;
    }

    let base_token_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id); // decimals: base_token_price.exponent 
    let base_token_price_scale = u256::from(10_u64).pow(base_token_price.exponent);
    let base_token_price = u256::from(base_token_price.price);
    
    let borrow_amount = present.value * base_token_price / base_token_price_scale; // decimals: base_token_decimals

    borrow_amount <= borrow_limit
}

// ## Check whether an account has enough collateral to not be liquidated
// ### Parameters:
// - `account`: The address of the account to be checked
// ### Returns:
// - `bool`: True if the account is liquidatable, False otherwise
#[storage(read)]
fn is_liquidatable_internal(account: Address) -> bool {
    let principal = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default()).principal; // decimals: base_asset_decimal
    
    if !principal.negative {
        return false
    };

    let present: u256 = present_value(principal.flip()).into(); // decimals: base_token_decimals

    let mut liquidation_treshold: u256 = 0;

    let mut index = 0;
    while index < storage.collateral_configurations_keys.len() {
        let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();

        let balance = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0); // decimals: collateral_configuration.decimals

        let price = get_price_internal(
            collateral_configuration
                .price_feed_id,
        ); // decimals: price.exponent
        let price_scale = u256::from(10.pow(price.exponent));
        let price = u256::from(price.price); // decimals: price.exponent

        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
        let base_scale = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals);

        let amount = balance * price / price_scale; // decimals: collateral_configuration.decimals
        liquidation_treshold += amount * collateral_configuration.liquidate_collateral_factor * base_scale / FACTOR_SCALE_18 / collateral_scale; // decimals: base_token_decimals

        index += 1;
    }

    let base_token_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id); // decimals: base_token_price.exponent
    let base_token_price_scale = u256::from(10_u64).pow(base_token_price.exponent);
    let base_token_price = u256::from(base_token_price.price); // decimals: base_token_price.exponent

    let borrow_amount = present * base_token_price / base_token_price_scale; // decimals: base_token_decimals

    borrow_amount > liquidation_treshold
}

// ## Get the collateral reserves of an asset
// ### Parameters:
// - `asset_id`: The asset ID of the collateral asset
// ### Returns:
// - `reserves`: The reserves (asset decimals)
#[storage(read)]
fn get_collateral_reserves_internal(asset_id: b256) -> I256 {
    I256::from(this_balance(AssetId::from(asset_id))) - I256::from(storage.totals_collateral.get(asset_id).try_read().unwrap_or(0))
}

// ## Get the total amount of protocol reserves of the base asset
// ### Returns:
// - `reserves`: The reserves (base_token_decimals)
#[storage(read)]
fn get_reserves_internal() -> I256 {
    let market_basic = storage.market_basic.read();
    
    let (base_supply_index, base_borrow_index) = accrued_interest_indices(timestamp().into(), market_basic.last_accrual_time); // decimals: (18, 18)
    let balance = this_balance(AssetId::from(storage.market_configuration.read().base_token)); // decimals: base_token_decimals
    
    let total_supply = present_value_supply(base_supply_index, market_basic.total_supply_base); // decimals: base_token_decimals
    let total_borrow = present_value_borrow(base_borrow_index, market_basic.total_borrow_base); // decimals: base_token_decimals
    
    I256::from(balance) - I256::from(total_supply) + I256::from(total_borrow)
}

// ## Accrue interest
#[storage(read, write)]
fn accrue_internal() {
    let mut market_basic = storage.market_basic.read();

    // Read time and calculate time elapsed since last accrual
    let now: u256 = timestamp().into();
    let time_elapsed = now - market_basic.last_accrual_time;

    if time_elapsed > 0 {
        if market_basic.last_accrual_time != 0 {
            let (base_supply_index, base_borrow_index) = accrued_interest_indices(now, market_basic.last_accrual_time);

            // Update base supply and borrow indices
            market_basic.base_supply_index = base_supply_index;
            market_basic.base_borrow_index = base_borrow_index;
        }

        let base_scale = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals);

        // Calculate rewards and update tracking indices
        if market_basic.total_supply_base >= storage.market_configuration.read().base_min_for_rewards {
            market_basic.tracking_supply_index += storage.market_configuration.read().base_tracking_supply_speed * time_elapsed * base_scale / market_basic.total_supply_base; // decimals: 15
        }
        if market_basic.total_borrow_base >= storage.market_configuration.read().base_min_for_rewards {
            market_basic.tracking_borrow_index += storage.market_configuration.read().base_tracking_borrow_speed * time_elapsed * base_scale / market_basic.total_borrow_base; // decimals: 15
        }

        // Update last_accrual_time
        market_basic.last_accrual_time = now;

        // Write to storage (market_basic)
        storage.market_basic.write(market_basic);

        // Emit market basic event
        log(MarketBasicEvent {
            market_basic,
        });
    }
}

// ## Update the base principal
// ### Description:
// - The function through which any balance changes will pass. updates the reward variables on the user
// ### Parameters:
// - `account`: The address of the user
// - `basic`: The user basic information
// - `principal_new`: The new principal value
#[storage(write, read)]
fn update_base_principal(account: Address, basic: UserBasic, principal_new: I256) {
    let market_basic = storage.market_basic.read();

    let principal = basic.principal;
    let mut basic = basic;
    basic.principal = principal_new;

    let accrual_descale_factor: u256 = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals) / BASE_ACCRUAL_SCALE; 

    // Calculate accrued base interest
    if principal >= I256::zero() {
        let index_delta: u256 = market_basic.tracking_supply_index - basic.base_tracking_index;
        let base_tracking_accrued_delta = index_delta * principal.into() / storage.market_configuration.read().base_tracking_index_scale / accrual_descale_factor;
        basic.base_tracking_accrued += base_tracking_accrued_delta;
    } else {
        let index_delta: u256 = market_basic.tracking_borrow_index - basic.base_tracking_index;
        let base_tracking_accrued_delta = index_delta * principal.flip().into() / storage.market_configuration.read().base_tracking_index_scale / accrual_descale_factor;
        basic.base_tracking_accrued += base_tracking_accrued_delta;
    }

    // Update base tracking indices
    if principal_new >= I256::zero() {
        basic.base_tracking_index = market_basic.tracking_supply_index;
    } else {
        basic.base_tracking_index = market_basic.tracking_borrow_index;
    }

    // Write storage (user basic)
    storage.user_basic.insert(account, basic);

    // Emit user basic event
    log(UserBasicEvent {
        address: account,
        user_basic: basic,
    });
}

// ## Calculate repay and supply amounts
// ### Description
// - The change in principal broken into repay and supply amounts
// ### Parameters:
// - `old_principal`: The principal before the change
// - `new_principal`: The principal after the change
// ### Returns:
// - `repay_amount`: The amount of base asset to be repaid
// - `supply_amount`: The amount of base asset to be supplied
fn repay_and_supply_amount(old_principal: I256, new_principal: I256) -> (u256, u256) {
    // If the new principal is less than the old principal, then no amount has been repaid or supplied
    if new_principal < old_principal {
        return (u256::zero(), u256::zero())
    };

    if new_principal <= I256::zero() {
        return ((new_principal - old_principal).into(), u256::zero());
    } else if old_principal >= I256::zero() {
        return (u256::zero(), (new_principal - old_principal).into());
    } else {
        return (old_principal.flip().into(), new_principal.into());
    }
}

// ## Calculate withdraw and borrow amounts
// ### Description
// - The change in principal broken into withdraw and borrow amounts
// ### Parameters:
// - `old_principal`: The principal before the change
// - `new_principal`: The principal after the change
// ### Returns:
// - `withdraw_amount`: The amount of base asset to be withdrawn
// - `borrow_amount`: The amount of base asset to be borrowed
fn withdraw_and_borrow_amount(old_principal: I256, new_principal: I256) -> (u256, u256) {
    // If the new principal is greater than the old principal, then no amount has been withdrawn or borrowed
    if new_principal > old_principal {
        return (u256::zero(), u256::zero())
    };

    if new_principal >= I256::zero() {
        return ((old_principal - new_principal).into(), u256::zero());
    } else if old_principal <= I256::zero() {
        return (u256::zero(), (old_principal - new_principal).into());
    } else {
        return ((old_principal).into(), (new_principal).flip().into());
    }
}

// ## Get collateral quote for an amount of base asset
// ### Parameters:
// - `asset_id`: The asset ID of the collateral asset
// - `base_amount`: The amount of base asset
// ### Returns:
// - `quote`: The quote for the collateral asset in exchange for the base asset
#[storage(read)]
fn quote_collateral_internal(asset_id: b256, base_amount: u256) -> u256 {
    let collateral_configuration = storage.collateral_configurations.get(asset_id).read();

    // Get the asset price
    let asset_price = get_price_internal(collateral_configuration.price_feed_id); // decimals: asset_price.exponent
    let asset_price_scale = u256::from(10_u64).pow(asset_price.exponent);
    let asset_price = u256::from(asset_price.price); // decimals: asset_price.exponent

    // Get the base token price
    let base_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id); // decimals: base_price.exponent 
    let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
    let base_price = u256::from(base_price.price); // decimals: base_price.exponent 

    let discount_factor: u256 = storage.market_configuration.read().store_front_price_factor * (FACTOR_SCALE_18 - collateral_configuration.liquidation_penalty) / FACTOR_SCALE_18; // decimals: 18

    let asset_price_discounted: u256 = asset_price * (FACTOR_SCALE_18 - discount_factor) / FACTOR_SCALE_18; // decimals: asset_price.exponent

    let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
    let base_scale = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals);
    
    let value =  base_price * base_amount / base_scale; // decimals: base_price.exponent
    value * asset_price_scale * collateral_scale / asset_price_discounted / base_price_scale  // decimals: collateral_configuration.decimals
}

// ## Absorb an account
// ### Description:
// - The function transfers the pledge (collateral) to the property of the protocol and closes the user's debt
// ### Parameters:
// - `account`: The address of the account to be absorbed
#[storage(read, write)]
fn absorb_internal(account: Address) {
    // Check that the account is liquidatable
    require(is_liquidatable_internal(account), Error::NotLiquidatable);

    let caller = msg_sender_address();

    // Get the user's basic information
    let account_user = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default());
    let old_principal = account_user.principal;
    let old_balance = present_value(old_principal); // decimals: base_token_decimals

    let mut delta_value: u256 = 0; // decimals: 18

    // Only used for logging event
    let mut total_value: u256 = 0; // decimals: 18

    let mut index = 0;
    while index < storage.collateral_configurations_keys.len() {
        let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();
        let seize_amount = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0); // decimals: collateral_asset_decimals

        // If the user has no collateral of the asset, skip to the next asset
        if seize_amount == u256::zero() {
            index += 1;
            continue;
        }

        // Set the user's collateral for the asset to 0
        storage
            .user_collateral
            .insert((account, collateral_configuration.asset_id), 0);

        // Update the total collateral for the asset
        let total_collateral = storage.totals_collateral.get(collateral_configuration.asset_id).try_read().unwrap_or(0); 
        storage
            .totals_collateral
            .insert(
                collateral_configuration
                    .asset_id,
                total_collateral - seize_amount,
            );

        // Get price of the collateral asset
        let price = get_price_internal(
            collateral_configuration
                .price_feed_id,
        ); // decimals: price.exponent
        let price_exponent = price.exponent;
        let price_scale = u256::from(10_u64).pow(price.exponent);
        let price = u256::from(price.price); // decimals: price.exponent

        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);

        // Apply liquidation penalty to the seized amount
        delta_value += seize_amount * price * collateral_configuration.liquidation_penalty / collateral_scale / price_scale; // decimals: 18
        index += 1;

        // Total value of seized collateral with liquidation penalty
        total_value += seize_amount * price * FACTOR_SCALE_18 / collateral_scale / price_scale; // decimals: 18

        let seize_value = seize_amount * price / collateral_scale; // decimals: price.exponent

        // Emit absorb collateral event
        log(AbsorbCollateralEvent {
            address: account,
            asset_id: collateral_configuration.asset_id,
            amount: seize_amount, // decimals: collateral_asset_decimals
            seize_value, // decimals: price.exponent
            decimals: price_exponent,
        });
    }

    // Get the base token price
    let base_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id); // decimals: base_token_price.exponent
    let base_price_exponent = base_price.exponent;
    let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
    let base_price = u256::from(base_price.price); // decimals: base_token_price.exponent
    let base_scale = (u256::from(10_u64)).pow(storage.market_configuration.read().base_token_decimals);

    // Calculate the new balance of the user
    let delta_balance = delta_value * base_price_scale * base_scale / base_price / FACTOR_SCALE_18; // decimals: base_token_decimals
    let delta_balance_value = delta_balance * base_price / base_scale; // decimals: price.exponent
    let mut new_balance = old_balance + I256::from(delta_balance); // decimals: base_token_decimals

    if new_balance < I256::zero() {
        new_balance = I256::zero();
    }

    // Calculate the new principal value of the user
    let new_principal = principal_value(new_balance);
    update_base_principal(account, account_user, new_principal);

    // Calculate the repay and supply amounts
    let (repay_amount, supply_amount) = repay_and_supply_amount(old_principal, new_principal);

    // Reserves are decreased by increasing total supply and decreasing borrows
    // the amount of debt repaid by reserves is `newBalance - oldBalance`
    let mut market_basic = storage.market_basic.read();
    market_basic.total_supply_base += supply_amount;
    market_basic.total_borrow_base -= repay_amount;
    storage.market_basic.write(market_basic);

    // Emit market basic event
    log(MarketBasicEvent {
        market_basic,
    });


    let total_base = total_value * base_price_scale * base_scale / base_price / FACTOR_SCALE_18; // decimals: base_token_decimals
    let total_base_value = total_base * base_price / base_scale; // decimals: price.exponent

    // Emit user liquidated event
    log(UserLiquidatedEvent {
        address: account,
        liquidator: caller,
        base_paid_out: delta_balance,
        base_paid_out_value: delta_balance_value,
        total_base,
        total_base_value: delta_balance_value,
        decimals: base_price_exponent,
    });
}
