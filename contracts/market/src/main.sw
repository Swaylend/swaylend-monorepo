// SPDX-License-Identifier: MIT

contract;

//
// @title Swaylend's Market Contract
// @notice An efficient monolithic money market protocol
// @author Reserve Labs LTD
//

mod events;

use events::*;

use pyth_interface::{data_structures::price::{Price, PriceFeedId}, PythCore};
use market_abi::{Market, structs::*,};
use std::asset::{mint_to, transfer};
use std::auth::{AuthError, msg_sender};
use std::call_frames::msg_asset_id;
use std::contract_id::ContractId;
use std::context::{msg_amount, this_balance};
use std::hash::{Hash, sha256};
use std::logging::log;
use std::revert::require;
use std::storage::storage_vec::*;
use std::u128::U128;
use std::vec::Vec;
use std::bytes::Bytes;
use std::convert::TryFrom;
use sway_libs::reentrancy::reentrancy_guard;
use standards::src5::{SRC5, State};
use sway_libs::ownership::*;
use sway_libs::signed_integers::i256::I256;

// version of the smart contract
const VERSION: u8 = 4_u8;

// pyth oracle configuration params
const ORACLE_MAX_STALENESS: u64 = 60; // 60 seconds
const ORACLE_MAX_AHEADNESS: u64 = 60; // 60 seconds
const ORACLE_MAX_CONF_WIDTH: u256 = 100; // 100 / 10000 = 1.0 % 

// This is set during deployment of the contract
configurable {
    DEBUG_STEP: u64 = 0,
}

storage {
    // market configuration
    market_configuration: MarketConfiguration = MarketConfiguration::default(),
    // configuration for collateral assets (can add, pause ...)
    collateral_configurations: StorageMap<AssetId, CollateralConfiguration> = StorageMap {},
    // list of asset ids of collateral assets
    collateral_configurations_keys: StorageVec<AssetId> = StorageVec {},
    // booleans to pause certain functionalities
    pause_config: PauseConfiguration = PauseConfiguration::default(),
    // total collateral for each asset
    totals_collateral: StorageMap<AssetId, u64> = StorageMap {},
    // how much collateral user provided (separate for each asset)
    user_collateral: StorageMap<(Identity, AssetId), u64> = StorageMap {},
    // holds information about the users details in the market
    user_basic: StorageMap<Identity, UserBasic> = StorageMap {},
    // information about the whole market (total supply, total borrow, etc.)
    market_basic: MarketBasics = MarketBasics::default(),
    // debug timestamp (for testing purposes)
    debug_timestamp: u64 = 0,
    // pyth contract id
    pyth_contract_id: ContractId = ContractId::zero(),
}

// Market contract implementation
impl Market for Contract {
    /// Get version of the smart contract
    /// # Returns
    /// * [u8] - The version number of the smart contract.
    fn get_version() -> u8 {
        VERSION
    }

    // ## 0. Activate contract
    /// # Arguments
    /// * `market_configuration`: [MarketConfiguration] - The configuration settings for the market.
    /// * `owner`: [Identity] - The identity of the owner of the contract.
    ///
    /// # Reverts
    /// * When the contract is already active, indicated by a non-zero last accrual time.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `4`
    /// * Reads: `2`
    #[storage(write)]
    fn activate_contract(market_configuration: MarketConfiguration, owner: Identity) {
        require(
            storage
                .market_basic
                .last_accrual_time
                .read() == 0,
            Error::AlreadyActive,
        );

        // Set owner
        initialize_ownership(owner);

        // Set market configuration
        storage.market_configuration.write(market_configuration);

        // Set last_accrual_time to current timestamp
        storage
            .market_basic
            .last_accrual_time
            .write(timestamp().into());

        let market_basic = storage.market_basic.read();

        let pause_config = PauseConfiguration {
            supply_paused: false,
            withdraw_paused: false,
            absorb_paused: false,
            buy_paused: false,
        };

        // Un-pause the contract
        storage.pause_config.write(pause_config);

        // Emit pause configuration updated event
        log(PauseConfigurationEvent { pause_config });

        // Emit market configuration event
        log(MarketConfigurationEvent {
            market_config: market_configuration,
        });

        // Emit market basic event
        log(MarketBasicEvent { market_basic });
    }

    // ## 1. Debug functionality (for testing purposes)

    // ## 1.1 Manually increment timestamp
    /// This function is useful for testing purposes, allowing developers to simulate time progression during debugging.
    ///
    /// # Reverts
    /// * When `DEBUG_STEP` is not greater than zero, indicating that debugging is disabled.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    /// * Reads: `1`
    #[storage(write)]
    fn debug_increment_timestamp() {
        require(DEBUG_STEP > 0, Error::DebuggingDisabled);

        storage
            .debug_timestamp
            .write(storage.debug_timestamp.read() + DEBUG_STEP);
    }

    // ## 2. Collateral asset management

    // ## 2.1 Add new collateral asset
    /// # Arguments
    /// * `configuration`: [CollateralConfiguration] - The collateral configuration to be added.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    /// * When the asset already exists, indicated by a non-`None` value in the storage.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `2`
    /// * Reads: `1`
    #[storage(write)]
    fn add_collateral_asset(configuration: CollateralConfiguration) {
        // Only owner can add new collateral asset
        only_owner();

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

        log(CollateralAssetAdded {
            asset_id: configuration.asset_id,
            configuration,
        });
    }

    // ## 2.2 Pause an existing collateral asset
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset to be paused.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    /// * Reads: `1`   
    #[storage(write)]
    fn pause_collateral_asset(asset_id: AssetId) {
        // Only owner can pause collateral asset
        only_owner();

        let mut configuration = storage.collateral_configurations.get(asset_id).read();
        configuration.paused = true;
        storage
            .collateral_configurations
            .insert(asset_id, configuration);

        log(CollateralAssetPaused {
            asset_id: configuration.asset_id,
        });
    }

    // ## 2.3 Resume a paused collateral asset
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset to be resumed.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    /// * Reads: `1`
    #[storage(write)]
    fn resume_collateral_asset(asset_id: AssetId) {
        // Only owner can resume collateral asset
        only_owner();

        let mut configuration = storage.collateral_configurations.get(asset_id).read();
        configuration.paused = false;
        storage
            .collateral_configurations
            .insert(asset_id, configuration);

        log(CollateralAssetResumed {
            asset_id: configuration.asset_id,
        });
    }

    // ## 2.4 Update an existing collateral asset configuration
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset to be updated.
    /// * `configuration`: [CollateralConfiguration] - The new collateral configuration.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    /// * When the asset does not exist, indicated by a non-`Some` value in the storage.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    /// * Reads: `1`
    #[storage(write)]
    fn update_collateral_asset(asset_id: AssetId, configuration: CollateralConfiguration) {
        // Only owner can update collateral asset
        only_owner();

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

        log(CollateralAssetUpdated {
            asset_id,
            configuration,
        });
    }

    // ## 2.5 Get all collateral asset configurations
    /// This function retrieves all collateral asset configurations in the market.
    ///
    /// # Returns
    /// * [Vec<CollateralConfiguration>]: A list of collateral configurations
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1 + storage.collateral_configurations_keys.len()`
    #[storage(read)]
    fn get_collateral_configurations() -> Vec<CollateralConfiguration> {
        let mut result = Vec::new();
        let mut index = 0;

        let len = storage.collateral_configurations_keys.len();

        while index < len {
            let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();
            result.push(collateral_configuration);
            index += 1;
        }

        result
    }

    // ## 3. Collateral asset management (Supply and Withdrawal)

    // ## 3.1 Supply Collateral
    /// This function ensures that the supplied collateral adheres to the market's rules and limits.
    ///
    /// # Reverts
    /// * When the supply is paused.
    /// * When the supplied amount is less than or equal to zero.
    /// * When the collateral asset is paused.
    /// * When the total collateral exceeds the supply cap.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `2`
    /// * Reads: `4`
    #[payable, storage(write)]
    fn supply_collateral() {
        // Only allow supplying collateral if paused flag is not set
        require(!storage.pause_config.supply_paused.read(), Error::Paused);

        // Check that the amount is greater than 0
        let amount = msg_amount();
        require(amount > 0, Error::InvalidPayment);

        // Get the asset ID of the collateral asset being supplied and check that it is not paused
        let asset_id: AssetId = msg_asset_id();
        let collateral_configuration = storage.collateral_configurations.get(asset_id).read();
        require(!collateral_configuration.paused, Error::Paused);

        // Check that the new total collateral does not exceed the supply cap
        let total_collateral = storage.totals_collateral.get(asset_id).try_read().unwrap_or(0) + amount;
        require(
            collateral_configuration
                .supply_cap >= total_collateral,
            Error::SupplyCapExceeded,
        );

        // Get the caller's account and calculate the new user collateral
        let caller = msg_sender().unwrap();
        let user_collateral = storage.user_collateral.get((caller, asset_id)).try_read().unwrap_or(0) + amount;

        // Update the storage values (total collateral, user collateral)
        storage.totals_collateral.insert(asset_id, total_collateral);
        storage
            .user_collateral
            .insert((caller, asset_id), user_collateral);

        // Log user supply collateral event
        log(UserSupplyCollateralEvent {
            account: caller,
            asset_id,
            amount,
        });
    }

    // ## 3.2 Withdraw Collateral
    /// This function ensures that the withdrawal adheres to the market's rules and checks for collateralization.
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset to be withdrawn.
    /// * `amount`: [u64] - The amount of collateral to be withdrawn.
    /// * `price_data_update`: [PriceDataUpdate] - The price data update struct to be used for updating the price feeds.
    ///
    /// # Reverts
    /// * When the user is not collateralized.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `2`
    /// * Reads: `4`
    #[payable, storage(write)]
    fn withdraw_collateral(
        asset_id: AssetId,
        amount: u64,
        price_data_update: PriceDataUpdate,
    ) {
        reentrancy_guard();

        // Only allow withdrawing collateral if paused flag is not set
        require(!storage.pause_config.withdraw_paused.read(), Error::Paused);

        // Get the caller's account and calculate the new user and total collateral
        let caller = msg_sender().unwrap();
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

        transfer(caller, asset_id, amount);

        // Log user withdraw collateral event
        log(UserWithdrawCollateralEvent {
            account: caller,
            asset_id,
            amount,
        });
    }

    // ## 3.3 Get User Collateral
    /// This function retrieves the amount of collateral a user has supplied for a specific asset.
    /// # Arguments
    /// * `account`: [Identity] - The account of the user.
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
    ///
    /// # Returns
    /// * [u64] - The amount of collateral the user has supplied for the specified asset.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    #[storage(read)]
    fn get_user_collateral(account: Identity, asset_id: AssetId) -> u64 {
        storage.user_collateral.get((account, asset_id)).try_read().unwrap_or(0)
    }

    // ## 3.4 Get all of User's Collateral assets
    /// This function retrieves all collateral assets that a user has supplied, along with their respective amounts.
    /// # Arguments
    /// * `account`: [Identity] - The account of the user.
    ///
    /// # Returns
    /// * [Vec<(AssetId, u64)>] - A list of tuples containing the asset ID and total collateral for each collateral asset.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `storage.collateral_configurations_keys.len()`
    /// * Reads: `1 + storage.collateral_configurations_keys.len() * 3`
    #[storage(read)]
    fn get_all_user_collateral(account: Identity) -> Vec<(AssetId, u64)> {
        let mut result = Vec::new();
        let mut index = 0;

        let len = storage.collateral_configurations_keys.len();

        while index < len {
            let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();
            let collateral_amount = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0);
            result.push((collateral_configuration.asset_id, collateral_amount));
            index += 1;
        }
        result
    }

    // ## 3.5 Get Total Collateral
    /// This function retrieves the total collateral amount for a specific asset.
    ///
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
    ///
    /// # Returns
    /// * [u64] - The total collateral ammount.

    /// # Number of Storage Accesses
    /// * Writes: `1`
    #[storage(read)]
    fn totals_collateral(asset_id: AssetId) -> u64 {
        storage.totals_collateral.get(asset_id).try_read().unwrap_or(0)
    }

    // ## 3.6 Get Total Collateral for all collateral assets
    /// This function retrieves the total collateral amount for all collateral assets in the market.
    ///
    /// # Returns
    /// * [`Vec<(AssetId, u64)>`]: A list of tuples containing the asset ID and total collateral for each collateral asset
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1 + storage.collateral_configurations_keys.len() * 2`
    #[storage(read)]
    fn get_all_totals_collateral() -> Vec<(AssetId, u64)> {
        let mut result = Vec::new();
        let mut index = 0;

        let len = storage.collateral_configurations_keys.len();

        while index < len {
            let asset_id = storage.collateral_configurations_keys.get(index).unwrap().read();
            result.push((asset_id, storage.totals_collateral.get(asset_id).try_read().unwrap_or(0)));
            index += 1;
        }
        result
    }

    // ## 4. Base asset management (Supply and Withdrawal)

    // ## 4.1 Supply Base
    /// This function allows users to supply base assets to the market, updating their balance and the market's total supply.
    ///
    /// # Arguments
    /// This function does not take any parameters directly, as it uses the message context to retrieve the amount and asset ID.
    ///
    /// # Reverts
    /// * When the supply is paused.
    /// * When the supplied amount is less than or equal to zero.
    /// * When the supplied asset is not the base asset.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `2`
    /// * Reads: `4`
    #[payable, storage(write)]
    fn supply_base() {
        // Only allow supplying if paused flag is not set
        require(!storage.pause_config.supply_paused.read(), Error::Paused);

        // Check that the amount is greater than 0 and that supplied asset is the base asset
        let amount = msg_amount();
        let base_asset_id = storage.market_configuration.read().base_token;
        require(
            amount > 0 && msg_asset_id() == base_asset_id,
            Error::InvalidPayment,
        );

        // Accrue interest
        accrue_internal();

        // Get caller's user basic state
        let caller = msg_sender().unwrap();
        let user_basic = storage.user_basic.get(caller).try_read().unwrap_or(UserBasic::default());
        let user_principal = user_basic.principal;

        // Calculate new balance and principal value
        let user_balance = present_value(user_principal) + I256::try_from(u256::from(amount)).unwrap();
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

        if user_balance < I256::zero() {
            // Check that the borrow amount is greater than the minimum allowed
            require(
                u256::try_from(user_balance.wrapping_neg())
                    .unwrap() >= storage
                    .market_configuration
                    .read()
                    .base_borrow_min,
                Error::BorrowTooSmall,
            );
        }

        // Emit user supply base event
        log(UserSupplyBaseEvent {
            account: caller,
            supply_amount,
            repay_amount,
        });

        // Emit market basic event
        log(MarketBasicEvent { market_basic });
    }

    // ## 4.2 Withdraw base (borrowing if possible/necessary)
    /// This function allows users to withdraw a specified amount of base assets, potentially borrowing if necessary.
    ///
    /// # Arguments
    /// * `amount`: [u64] - The amount of base asset to be withdrawn.
    /// * `price_data_update`: [PriceDataUpdate] - The price data update struct to be used for updating the price feeds.
    ///
    /// # Reverts
    /// * When the user is not collateralized.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `3`
    /// * Reads: `5`
    #[payable, storage(write)]
    fn withdraw_base(amount: u64, price_data_update: PriceDataUpdate) {
        reentrancy_guard();

        // Only allow withdrawing if paused flag is not set
        require(!storage.pause_config.withdraw_paused.read(), Error::Paused);

        // Check that the amount is greater than 0
        require(amount > 0, Error::InvalidPayment);

        // Accrue interest
        accrue_internal();

        // Get caller's user basic state
        let caller = msg_sender().unwrap();
        let user_basic = storage.user_basic.get(caller).try_read().unwrap_or(UserBasic::default());
        let user_principal = user_basic.principal;

        // Calculate new balance and principal value
        let user_balance = present_value(user_principal) - I256::try_from(u256::from(amount)).unwrap();
        let user_principal_new = principal_value(user_balance);

        // Calculate withdraw and borrow amounts
        let (withdraw_amount, borrow_amount) = withdraw_and_borrow_amount(user_principal, user_principal_new);

        log(UserWithdrawBaseEvent {
            account: caller,
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
        log(MarketBasicEvent { market_basic });

        // Update and write principal to storage
        update_base_principal(caller, user_basic, user_principal_new);

        if user_balance < I256::zero() {
            // Check that the borrow amount is greater than the minimum allowed
            require(
                u256::try_from(user_balance.wrapping_neg())
                    .unwrap() >= storage
                    .market_configuration
                    .read()
                    .base_borrow_min,
                Error::BorrowTooSmall,
            );

            // Update price data
            update_price_feeds_if_necessary_internal(price_data_update);

            // Check that the user is borrow collateralized
            require(is_borrow_collateralized(caller), Error::NotCollateralized);
        }

        // Transfer base asset to the caller
        transfer(
            caller,
            storage
                .market_configuration
                .read()
                .base_token,
            amount,
        );
    }

    // ## 4.3 Get user supply and borrow
    /// This function retrieves the amount of base asset supplied and borrowed by a specific user.
    ///
    /// # Arguments
    /// * `account`: [Identity] - The account of the user.
    ///
    /// # Returns
    /// * [u256] - The amount of base asset supplied by the user.
    /// * [u256] - The amount of base asset borrowed by the user.
    /// 
    /// # Number of Storage Accesses
    /// * Reads: `3`
    #[storage(read)]
    fn get_user_supply_borrow(account: Identity) -> (u256, u256) {
        get_user_supply_borrow_internal(account)
    }

    // ## 4.4 Get how much user can borrow
    /// This function calculates the amount of base asset a user can borrow based on their collateral and current borrow position.
    ///
    /// # Arguments
    /// * `account`: [Identity] - The account of the user.
    ///
    /// # Returns
    /// * [u256] - The amount of base asset the user can borrow.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `4 + storage.collateral_configurations_keys.len() * 5`
    #[storage(read)]
    fn available_to_borrow(account: Identity) -> u256 {
        // Get user's supply and borrow
        let (_, borrow) = get_user_supply_borrow_internal(account);

        let mut borrow_limit: u256 = 0;

        // Calculate borrow limit for each collateral asset the user has
        let mut index = 0;
        let len = storage.collateral_configurations_keys.len();
        let market_configuration = storage.market_configuration.read();

        while index < len {
            let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();

            let balance: u256 = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0).into();

            if balance == 0 {
                index += 1;
                continue;
            }

            let price = get_price_internal(collateral_configuration.price_feed_id, PricePosition::LowerBound); // decimals: price.exponent
            let price_exponent = price.exponent;
            let price_scale = u256::from(10_u64).pow(price.exponent);
            let price = u256::from(price.price); // decimals: price.exponent
            let amount = balance * collateral_configuration.borrow_collateral_factor / FACTOR_SCALE_18; // decimals: collateral_configuration.decimals
            let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
            let base_asset_scale = u256::from(10_u64).pow(market_configuration.base_token_decimals);

            borrow_limit += amount * price * base_asset_scale / collateral_scale / price_scale; // decimals: base_token_decimals
            index += 1;
        };

        // Get the base token price 
        let base_price = get_price_internal(market_configuration.base_token_price_feed_id, PricePosition::Middle); // decimals: base_price.exponent
        let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
        let base_price = u256::from(base_price.price); // decimals: base_price.exponent

        let borrow_limit = borrow_limit * base_price_scale / base_price; // decimals: base_token_decimals

        if borrow_limit < borrow {
            u256::zero()
        } else {
            // Returns how much the user can borrow
            borrow_limit - borrow
        }
    }

    // # 5. Liquidation management

    // ## 5.1 Absorb
    /// This function absorbs a list of underwater accounts onto the protocol balance sheet.
    ///
    /// # Arguments
    /// * `accounts`: [Vec<Identity>] - The list of underwater accounts to be absorbed.
    /// * `price_data_update`: [PriceDataUpdate] - The price data update struct to be used for updating the price feeds.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `2 + accounts.len() * 4`
    /// * Reads: `5 + accounts.len() * 5`
    #[payable, storage(write)]
    fn absorb(accounts: Vec<Identity>, price_data_update: PriceDataUpdate) {
        reentrancy_guard();

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
    /// This function checks if an account is liquidatable.
    ///
    /// # Arguments
    /// * account: [Identity] - The account to be checked.
    ///
    /// # Returns
    /// * [bool] - True if the account is liquidatable, False otherwise.
    ///
    /// # Number of Storage Accesses
    /// * Reads: 1
    #[storage(read)]
    fn is_liquidatable(account: Identity) -> bool {
        let present = get_user_balance_with_interest_internal(account);
        is_liquidatable_internal(account, present)
    }

    // # 6. Protocol collateral management

    // ## 6.1 Buying collateral
    /// This function allows buying collateral from the protocol. Prices are not updated here as the caller is expected to update them in the same transaction using a multicall handler.
    ///
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset to be bought.
    /// * `min_amount`: [u64] - The minimum amount of collateral to be bought.
    /// * `recipient`: [Identity] - The account of the recipient of the collateral.
    ///
    /// # Reverts
    /// * When the buy operation is paused.
    /// * When payment is not in the base token or the amount is zero.
    /// * When reserves are sufficient or not less than target reserves.
    /// * When the quoted collateral amount is less than the minimum requested.
    /// * When collateral reserves are insufficient.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `8`
    #[payable, storage(read)]
    fn buy_collateral(asset_id: AssetId, min_amount: u64, recipient: Identity) {
        reentrancy_guard();

        // Only allow buying collateral if paused flag is not set
        require(!storage.pause_config.buy_paused.read(), Error::Paused);
        let payment_amount = msg_amount();

        // Only allow payment in the base token and check that the payment amount is greater than 0
        require(
            msg_asset_id() == storage
                .market_configuration
                .read()
                .base_token && payment_amount > 0,
            Error::InvalidPayment,
        );

        let reserves = get_reserves_internal() - I256::try_from(u256::from(payment_amount)).unwrap();

        // Only allow purchases if reserves are negative or if the reserves are less than the target reserves
        require(
            reserves < I256::try_from(storage.market_configuration.read().target_reserves)
                .unwrap(),
            Error::NotForSale,
        );

        let reserves = get_collateral_reserves_internal(asset_id);

        // Calculate the quote for a collateral asset in exchange for an amount of the base asset
        let collateral_amount = quote_collateral_internal(asset_id, payment_amount);

        // Check that the quote is greater than or equal to the minimum requested amount
        require(collateral_amount >= min_amount, Error::TooMuchSlippage);

        // Check that the quote is less than or equal to the reserves
        require(
            I256::try_from(u256::from(collateral_amount))
                .unwrap() <= reserves,
            Error::InsufficientReserves,
        );

        let caller = msg_sender().unwrap();

        // Emit buy collateral event
        log(BuyCollateralEvent {
            caller,
            recipient,
            asset_id,
            amount: collateral_amount,
            price: payment_amount,
        });

        // Transfer the collateral asset to the recipient
        transfer(recipient, asset_id, collateral_amount);
    }

    /// This function calculates the base asset value for selling a collateral asset.
    ///
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
    /// * `collateral_amount`: [u64] - The amount of the collateral asset.
    ///
    /// # Returns
    /// * [u64] - The value of the collateral asset in base asset.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `5`
    #[storage(read)]
    fn collateral_value_to_sell(asset_id: AssetId, collateral_amount: u64) -> u64 { // decimals: base_token_decimals
        let collateral_configuration = storage.collateral_configurations.get(asset_id).read();
        let market_configuration = storage.market_configuration.read();

        // Get the collateral asset price
        let asset_price = get_price_internal(collateral_configuration.price_feed_id, PricePosition::UpperBound); // decimals: asset_price.exponent
        let asset_price_scale = u256::from(10_u64).pow(asset_price.exponent);
        let asset_price = u256::from(asset_price.price); // decimals: asset_price.exponent
        let discount_factor: u256 = market_configuration.store_front_price_factor * (FACTOR_SCALE_18 - collateral_configuration.liquidation_penalty) / FACTOR_SCALE_18; // decimals: 18
        let asset_price_discounted: u256 = asset_price * (FACTOR_SCALE_18 - discount_factor) / FACTOR_SCALE_18; // decimals: asset_price.exponent

        // Get the base token price 
        let base_price = get_price_internal(market_configuration.base_token_price_feed_id, PricePosition::Middle); // decimals: base_price.exponent
        let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
        let base_price = u256::from(base_price.price); // decimals: base_price.exponent
        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
        let base_asset_scale = u256::from(10_u64).pow(market_configuration.base_token_decimals);

        let asset_discounted = asset_price_discounted * collateral_amount.into() / asset_price_scale; // decimals: collateral_asset.decimals
        let collateral_value = asset_discounted * base_asset_scale * base_price_scale / base_price / collateral_scale;

        // Native assets are in u64
        <u64 as TryFrom<u256>>::try_from(collateral_value).unwrap()
    }

    // ## 6.3 Get collateral quote for an amount of base asset
    /// This function calculates the quote for collateral by considering the asset price, base price, and discount factors based on the collateral configuration.
    ///
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
    /// * `base_amount`: [u64] - The amount of base asset for which the quote is requested.
    ///
    /// # Returns
    /// * [u64] - The quote for the collateral asset in exchange for the base asset.
    ///
    /// # Reverts
    /// * When the conversion from `u256` to `u64` fails due to overflow.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `2`
    #[storage(read)]
    fn quote_collateral(asset_id: AssetId, base_amount: u64) -> u64 {
        quote_collateral_internal(asset_id, base_amount)
    }

    // ## 7. Reserves management

    // ## 7.1 Get reserves
    /// This function calculates and returns the total amount of protocol reserves of the base asset.
    ///
    /// # Returns
    /// * [I256] - The reserves of the base asset, expressed in base token decimals.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `3` (Reads market basic, market configuration, and current balance of the base token.)
    #[storage(read)]
    fn get_reserves() -> I256 {
        get_reserves_internal()
    }

    // ## 7.2 Withdraw reserves
    /// This function allows the owner to withdraw a specified amount of reserves from the contract.
    ///
    /// # Arguments
    /// * `to`: [Identity] - The account to which the reserves will be sent.
    /// * `amount`: [u64] - The amount of reserves to be withdrawn.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    /// * When the amount requested exceeds the available reserves.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `4`
    #[storage(read)]
    fn withdraw_reserves(to: Identity, amount: u64) {
        // Only owner can withdraw reserves
        only_owner();

        let caller = msg_sender().unwrap();

        let reserves = get_reserves_internal();

        // Check that the amount is less than or equal to the reserves
        require(
            reserves >= I256::try_from(u256::from(amount))
                .unwrap(),
            Error::InsufficientReserves,
        );

        // Emit reserves withdrawn event
        log(ReservesWithdrawnEvent {
            caller,
            to,
            amount,
        });

        // Transfer the reserves to the recipient
        transfer(to, storage.market_configuration.read().base_token, amount)
    }

    // ## 7.3 Get the collateral reserves of an asset
    /// This function retrieves the reserves of a specified collateral asset.
    ///
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
    ///
    /// # Returns
    /// * [I256] - The reserves (in asset decimals).
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_collateral_reserves(asset_id: AssetId) -> I256 {
        get_collateral_reserves_internal(asset_id)
    }

    // ## 8. Pause management

    // ## 8.1 Pause
    /// This function updates the pause configuration of the contract.
    ///
    /// # Arguments
    /// * `pause_config`: [PauseConfiguration] - The pause configuration to be set.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    #[storage(write)]
    fn pause(pause_config: PauseConfiguration) {
        // Only owner can change the pause configuration
        only_owner();

        // Emit pause configuration updated event
        log(PauseConfigurationEvent { pause_config });

        storage.pause_config.write(pause_config);
    }

    /// This function retrieves the current pause configuration.
    ///
    /// # Returns
    /// * [PauseConfiguration] - The current pause configuration settings.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_pause_configuration() -> PauseConfiguration {
        storage.pause_config.read()
    }

    // # 9. Getters

    // ## 9.1 Get market configuration
    /// This function retrieves the current market configuration.
    ///
    /// # Returns
    /// * [MarketConfiguration] - The market configuration.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_market_configuration() -> MarketConfiguration {
        storage.market_configuration.read()
    }

    // ## 9.2 Get market basics
    /// This function retrieves the current market basic information.
    ///
    /// # Returns
    /// * [MarketBasics] - The market basic information.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_market_basics() -> MarketBasics {
        storage.market_basic.read()
    }

    // ## 9.4 Get market basics (with included interest)
    /// This function retrieves the current market basic information, including accrued interest.
    ///
    /// # Returns
    /// * [MarketBasics] - The market basic information (with included interest).
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_market_basics_with_interest() -> MarketBasics {
        let mut market_basic = storage.market_basic.read();
        let last_accrual_time = market_basic.last_accrual_time;
        let current_time = timestamp();

        // Calculate new indices
        let (supply_index, borrow_index) = accrued_interest_indices(current_time.into(), last_accrual_time);

        // Set latest values
        market_basic.last_accrual_time = current_time.into();
        market_basic.base_supply_index = supply_index;
        market_basic.base_borrow_index = borrow_index;
        market_basic.total_supply_base = present_value_supply(
            market_basic
                .base_supply_index,
            market_basic
                .total_supply_base,
        );
        market_basic.total_borrow_base = present_value_borrow(
            market_basic
                .base_borrow_index,
            market_basic
                .total_borrow_base,
        );

        market_basic
    }

    // ## 9.5 Get user basic
    /// This function retrieves the basic information of a specified user.
    ///
    /// # Arguments
    /// * `account`: [Identity] - The account of the user.
    ///
    /// # Returns
    /// * [UserBasic] - The user basic information.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_user_basic(account: Identity) -> UserBasic {
        storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default())
    }

    // ## 9.6 Get user balance (with included interest)
    /// This function retrieves the user's balance, including accrued interest.
    ///
    /// # Arguments
    /// * `account`: [Identity] - The account of the user.
    ///
    /// # Returns
    /// * [I256] - The user balance (with included interest).
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_user_balance_with_interest(account: Identity) -> I256 {
        get_user_balance_with_interest_internal(account)
    }

    // ## 9.7 Get utilization
    /// This function calculates the utilization of the market, defined as the ratio of total borrowed
    /// amount to total supplied amount.
    ///
    /// # Returns
    /// * [u256] - The utilization of the market (decimals 18).
    ///
    /// # Number of Storage Accesses
    /// * Reads: 1 (Reads market basic information).
    #[storage(read)]
    fn get_utilization() -> u256 {
        get_utilization_internal()
    }

    // ## 9.8 Get balance of an asset
    /// This function retrieves the balance of a specified asset for the contract.
    ///
    /// # Arguments
    /// * `asset_id`: [AssetId] - The asset ID of the asset whose balance is to be retrieved.
    ///
    /// # Returns
    /// * [u64] - The balance of the specified asset.
    fn balance_of(asset_id: AssetId) -> u64 {
        this_balance(asset_id)
    }

    // ## 9.9 Get supply rate for a given utilization
    /// This function calculates the supply rate based on the market's utilization.
    /// It applies different rates depending on whether the utilization is below or above the kink point.
    ///
    /// # Arguments
    /// * `utilization`: [u256] - The utilization of the market.
    ///
    /// # Returns
    /// * [u256] - The supply rate (decimals 18).
    ///
    /// # Number of Storage Accesses
    /// * Reads: `3 or 6`
    #[storage(read)]
    fn get_supply_rate(utilization: u256) -> u256 {
        get_supply_rate_internal(utilization)
    }

    // ## 9.10 Get borrow rate for a given utilization
    /// This function calculates the borrow rate based on the market's utilization. 
    /// It uses different rates depending on whether the utilization is below or above the kink point.
    ///
    /// # Arguments
    /// * `utilization`: [u256] - The utilization of the market.
    ///
    /// # Returns
    /// * [u256] - The borrow rate (decimals 18).
    ///
    /// # Number of Storage Accesses
    /// * Reads: `3 or 6`
    #[storage(read)]
    fn get_borrow_rate(utilization: u256) -> u256 {
        get_borrow_rate_internal(utilization)
    }

    // ## 10. Pyth Oracle management
    /// This function sets the Pyth contract ID, allowing the contract to interact with the Pyth oracle.
    ///
    /// # Arguments:
    /// * `contract_id`: [ContractId] - The contract ID of the Pyth oracle to be set.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    #[storage(write)]
    fn set_pyth_contract_id(contract_id: ContractId) {
        // Only owner can set the Pyth contract ID
        only_owner();
        storage.pyth_contract_id.write(contract_id);

        // Emit Pyth contract ID set event
        log(SetPythContractIdEvent { contract_id });
    }

    /// This function retrieves the contract ID of the Pyth contract.
    ///
    /// # Returns
    /// * [ContractId] - The contract ID of the Pyth contract.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_pyth_contract_id() -> ContractId {
        storage.pyth_contract_id.read()
    }

    /// This function ensures that the price data is fresh and meets the required validation criteria.
    ///
    /// # Arguments
    /// * `price_feed_id`: [PriceFeedId] - The ID of the price feed for which the price is being retrieved.
    ///
    /// # Returns
    /// * [Price] - The price data retrieved from the oracle.
    ///
    /// # Reverts
    /// * When the `contract_id` is zero, indicating the oracle contract ID is not set.
    /// * When the price is stale or ahead of the current timestamp.
    /// * When the price is less than or equal to zero.
    /// * When the confidence value exceeds the allowed width.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn get_price(price_feed_id: PriceFeedId) -> Price {
        get_price_internal(price_feed_id, PricePosition::Middle)
    }

    /// This function interacts with an external oracle to obtain the update fee and ensures that the contract ID is valid.
    ///
    /// # Arguments
    /// * `update_data`: [Vec<Bytes>] - The data used for the fee update request.
    ///
    /// # Returns
    /// * [u64] - The update fee retrieved from the oracle.
    ///
    /// # Reverts
    /// * When the contract ID is not set (i.e., it is zero).
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(read)]
    fn update_fee(update_data: Vec<Bytes>) -> u64 {
        update_fee_internal(update_data)
    }

    /// This function ensures that the provided price data update is valid and performs an update if the conditions are met.
    ///
    /// # Arguments
    /// * `price_data_update`: [PriceDataUpdate] - The data necessary for updating the price feeds.
    ///
    /// # Returns
    /// This function does not return a value.
    ///
    /// # Reverts
    /// * When the contract ID is not set (i.e., it is zero).
    /// * When the payment amount is insufficient or the asset ID is not the base asset.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[payable, storage(read)]
    fn update_price_feeds_if_necessary(price_data_update: PriceDataUpdate) {
        reentrancy_guard();
        update_price_feeds_if_necessary_internal(price_data_update)
    }

    // ## 11. Changing market configuration
    /// This function updates the market configuration, allowing the owner to modify settings while preserving certain values.
    ///
    /// # Arguments
    /// * `configuration`: [MarketConfiguration] - The new market configuration to be set.
    ///
    /// # Reverts
    /// * When the caller is not the owner.
    ///
    /// # Number of Storage Accesses
    /// * Writes: `1`
    /// * Reads: `2`
    #[storage(write)]
    fn update_market_configuration(configuration: MarketConfiguration) {
        // Only owner can update the market configuration
        only_owner();

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

    // ## 12. Ownership management
    /// This function allows the current owner to transfer ownership of the contract to a new owner.
    ///
    /// # Arguments
    /// * `new_owner`: [Identity] - The identity of the new owner.
    ///
    /// # Reverts
    /// * When the caller is not the current owner.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(write)]
    fn transfer_ownership(new_owner: Identity) {
        transfer_ownership(new_owner);
    }

    // This function allows the current owner to renounce their ownership of the contract, making it ownerless.
    ///
    /// # Additional Information
    /// This action is irreversible and should be done with caution, as it removes all ownership privileges.
    ///
    /// # Number of Storage Accesses
    /// * Reads: `1`
    #[storage(write)]
    fn renounce_ownership() {
        renounce_ownership();
    }
}

impl SRC5 for Contract {
    #[storage(read)]
    fn owner() -> State {
        _owner()
    }
}

/// This function ensures that the price data is fresh and meets the required validation criteria.
///
/// # Arguments
/// * `price_feed_id`: [PriceFeedId] - The ID of the price feed for which the price is being retrieved.
///
/// # Returns
/// * [Price] - The price data retrieved from the oracle.
///
/// # Reverts
/// * When the `contract_id` is zero, indicating the oracle contract ID is not set.
/// * When the price is stale or ahead of the current timestamp.
/// * When the price is less than or equal to zero.
/// * When the confidence value exceeds the allowed width.
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[storage(read)]
fn get_price_internal(price_feed_id: PriceFeedId, price_position: PricePosition) -> Price {
    let contract_id = storage.pyth_contract_id.read();
    require(
        contract_id != ContractId::zero(),
        Error::OracleContractIdNotSet,
    );

    let oracle = abi(PythCore, contract_id.bits());
    let mut price = oracle.price(price_feed_id);

    // validate values
    if price.publish_time < std::block::timestamp() {
        let staleness = std::block::timestamp() - price.publish_time;
        require(
            staleness <= ORACLE_MAX_STALENESS,
            Error::OraclePriceValidationError,
        );
    } else {
        let aheadness = price.publish_time - std::block::timestamp();
        require(
            aheadness <= ORACLE_MAX_AHEADNESS,
            Error::OraclePriceValidationError,
        );
    }

    require(price.price != 0, Error::OraclePriceValidationError);

    require(
        u256::from(price.confidence) <= (u256::from(price.price) * ORACLE_MAX_CONF_WIDTH / ORACLE_CONF_BASIS_POINTS),
        Error::OraclePriceValidationError,
    );

    if price_position == PricePosition::LowerBound {
        price.price = price.price - price.confidence;
    } else if price_position == PricePosition::UpperBound {
        price.price = price.price + price.confidence;
    }

    price
}

/// This function interacts with an external oracle to obtain the update fee and ensures that the contract ID is valid.
///
/// # Arguments
/// * `update_data`: [Vec<Bytes>] - The data used for the fee update request.
///
/// # Returns
/// * [u64] - The update fee retrieved from the oracle.
///
/// # Reverts
/// * When the contract ID is not set (i.e., it is zero).
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[storage(read)]
fn update_fee_internal(update_data: Vec<Bytes>) -> u64 {
    let contract_id = storage.pyth_contract_id.read();
    require(
        contract_id != ContractId::zero(),
        Error::OracleContractIdNotSet,
    );

    let oracle = abi(PythCore, contract_id.bits());
    let fee = oracle.update_fee(update_data);
    fee
}

/// This function ensures that the provided price data update is valid and performs an update if the conditions are met.
///
/// # Arguments
/// * `price_data_update`: [PriceDataUpdate] - The data necessary for updating the price feeds.
///
/// # Returns
/// This function does not return a value.
///
/// # Reverts
/// * When the contract ID is not set (i.e., it is zero).
/// * When the payment amount is insufficient or the asset ID is not the base asset.
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[payable, storage(read)]
fn update_price_feeds_if_necessary_internal(price_data_update: PriceDataUpdate) {
    let contract_id = storage.pyth_contract_id.read();
    require(
        contract_id != ContractId::zero(),
        Error::OracleContractIdNotSet,
    );

    // check if the payment is sufficient
    require(
        msg_amount() >= price_data_update
            .update_fee && msg_asset_id() == AssetId::base(),
        Error::InvalidPayment,
    );

    let oracle = abi(PythCore, contract_id.bits());
    oracle
        .update_price_feeds_if_necessary {
            asset_id: AssetId::base().bits(),
            coins: price_data_update.update_fee,
        }(
            price_data_update
                .price_feed_ids,
            price_data_update
                .publish_times,
            price_data_update
                .update_data,
        );
}

/// Returns the current timestamp or the timestamp of the last debug step if debugging is enabled.
///
/// # Returns
/// * [u64] - Timestamp.
#[storage(read)]
fn timestamp() -> u64 {
    if DEBUG_STEP > 0 {
        storage.debug_timestamp.read()
    } else {
        std::block::timestamp()
    }
}

/// Calculates the present value based on the given base supply index and principal value.
///
/// # Arguments
/// * `base_supply_index`: [u256] - The base supply index.
/// * `principal`: [u256] - The principal value.
///
/// # Returns
/// * [u256] - The present value (base_token_decimals).
///
/// # Examples
/// ```sway
/// let present_value = present_value_supply(base_supply_index, principal);
/// ```
pub fn present_value_supply(base_supply_index: u256, principal: u256) -> u256 {
    principal * base_supply_index / BASE_INDEX_SCALE_15
}

/// Calculates the present value based on the given base borrow index and principal value.
///
/// # Arguments
/// * `base_borrow_index`: [u256] - The base borrow index.
/// * `principal`: [u256] - The principal value.
///
/// # Returns
/// * [u256] - The present value (base_token_decimals).
///
/// # Examples
/// ```sway
/// let present_value = present_value_borrow(base_borrow_index, principal);
/// ```
pub fn present_value_borrow(base_borrow_index: u256, principal: u256) -> u256 {
    (principal * base_borrow_index + BASE_INDEX_SCALE_15 - 1) / BASE_INDEX_SCALE_15
}

/// Calculates the principal value based on the given base supply index and present value.
///
/// # Arguments
/// * `base_supply_index`: [u256] - The base supply index.
/// * `present`: [u256] - The present value.
///
/// # Returns
/// * [u256] - The principal value (base_token_decimals).
///
/// # Examples
/// ```sway
/// let principal = principal_value_supply(base_supply_index, present);
/// ```
pub fn principal_value_supply(base_supply_index: u256, present: u256) -> u256 {
    present * BASE_INDEX_SCALE_15 / base_supply_index
}

/// Calculates the principal value based on the given base borrow index and present value.
///
/// # Arguments
/// * `base_borrow_index`: [u256] - The base borrow index.
/// * `present`: [u256] - The present value.
///
/// # Returns
/// * [u256] - The principal value (base_token_decimals).
///
/// # Examples
/// ```sway
/// let principal = principal_value_borrow(base_borrow_index, present);
/// ```
pub fn principal_value_borrow(base_borrow_index: u256, present: u256) -> u256 {
    (present * BASE_INDEX_SCALE_15 + base_borrow_index - 1) / base_borrow_index
}

/// Calculates the present value based on the provided principal.
///
/// # Arguments
/// * `principal`: [I256] - The principal value (can be positive or negative).
///
/// # Returns
/// * [I256] - The present value (base_token_decimals).
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[storage(read)]
fn present_value(principal: I256) -> I256 {
    let market_basic = storage.market_basic.read();
    if principal >= I256::zero() {
        let present_value = present_value_supply(
            market_basic
                .base_supply_index,
            principal
                .try_into()
                .unwrap(),
        );
        I256::try_from(present_value).unwrap()
    } else {
        let present_value = present_value_borrow(
            market_basic
                .base_borrow_index,
            principal
                .wrapping_neg()
                .try_into()
                .unwrap(),
        );
        I256::neg_try_from(present_value).unwrap()
    }
}

/// Calculates the principal value based on the given present value. 
/// It determines whether the present value is positive or negative to calculate
/// the corresponding principal value from either supply or borrow.
///
/// # Arguments
/// * `present_value`: [I256] - The present value (can be positive or negative).
///
/// # Returns
/// * [I256] - The principal value (base_token_decimals).
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[storage(read)]
fn principal_value(present_value: I256) -> I256 {
    let market_basic = storage.market_basic.read();
    if present_value >= I256::zero() {
        let principal_value = principal_value_supply(
            market_basic
                .base_supply_index,
            present_value
                .try_into()
                .unwrap(),
        );
        I256::try_from(principal_value).unwrap()
    } else {
        let principal_value = principal_value_borrow(
            market_basic
                .base_borrow_index,
            present_value
                .wrapping_neg()
                .try_into()
                .unwrap(),
        );
        I256::neg_try_from(principal_value).unwrap()
    }
}

/// This function calculates the utilization of the market, defined as the ratio of total borrowed
/// amount to total supplied amount.
///
/// # Returns
/// * [u256] - The utilization of the market (decimals 18).
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[storage(read)]
fn get_utilization_internal() -> u256 {
    let market_basic = storage.market_basic.read();
    let total_supply_base = present_value_supply(
        market_basic
            .base_supply_index,
        market_basic
            .total_supply_base,
    );
    let total_borrow_base = present_value_borrow(
        market_basic
            .base_borrow_index,
        market_basic
            .total_borrow_base,
    );

    if total_supply_base == u256::zero() {
        u256::zero()
    } else {
        total_borrow_base * FACTOR_SCALE_18 / total_supply_base
    }
}

/// This function calculates the supply rate based on the market's utilization.
/// It applies different rates depending on whether the utilization is below or above the kink point.
///
/// # Arguments
/// * `utilization`: [u256] - The utilization of the market.
///
/// # Returns
/// * [u256] - The supply rate (decimals 18).
///
/// # Number of Storage Accesses
/// * Reads: `3 or 6`
#[storage(read)]
fn get_supply_rate_internal(utilization: u256) -> u256 {
    if utilization <= storage.market_configuration.read().supply_kink
    {
        storage.market_configuration.read().supply_per_second_interest_rate_base + storage.market_configuration.read().supply_per_second_interest_rate_slope_low * utilization / FACTOR_SCALE_18
    } else {
        storage.market_configuration.read().supply_per_second_interest_rate_base + (storage.market_configuration.read().supply_per_second_interest_rate_slope_low * storage.market_configuration.read().supply_kink / FACTOR_SCALE_18) + (storage.market_configuration.read().supply_per_second_interest_rate_slope_high * (utilization - storage.market_configuration.read().supply_kink) / FACTOR_SCALE_18)
    }
}

/// This function calculates the borrow rate based on the market's utilization. 
/// It uses different rates depending on whether the utilization is below or above the kink point.
///
/// # Arguments
/// * `utilization`: [u256] - The utilization of the market.
///
/// # Returns
/// * [u256] - The borrow rate (decimals 18).
///
/// # Number of Storage Accesses
/// * Reads: `3 or 6`
#[storage(read)]
fn get_borrow_rate_internal(utilization: u256) -> u256 {
    if utilization <= storage.market_configuration.read().borrow_kink
    {
        storage.market_configuration.read().borrow_per_second_interest_rate_base + storage.market_configuration.read().borrow_per_second_interest_rate_slope_low * utilization / FACTOR_SCALE_18
    } else {
        storage.market_configuration.read().borrow_per_second_interest_rate_base + (storage.market_configuration.read().borrow_per_second_interest_rate_slope_low * storage.market_configuration.read().borrow_kink / FACTOR_SCALE_18) + (storage.market_configuration.read().borrow_per_second_interest_rate_slope_high * (utilization - storage.market_configuration.read().borrow_kink) / FACTOR_SCALE_18)
    }
}

/// This function calculates the user's supply and borrow amounts for the base asset. 
/// It retrieves the user's principal and computes the supply and borrow based on the 
/// accrued interest indices.
///
/// # Arguments
/// * `account`: [Identity] - The account of the user.
///
/// # Returns
/// * [u256] - The amount of base asset supplied by the user.
/// * [u256] - The amount of base asset borrowed by the user.
///
/// # Number of Storage Accesses
/// * Reads: `3`
#[storage(read)]
fn get_user_supply_borrow_internal(account: Identity) -> (u256, u256) {
    let principal = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default()).principal;
    let last_accrual_time = storage.market_basic.last_accrual_time.read();
    let (supply_index, borrow_index) = accrued_interest_indices(timestamp().into(), last_accrual_time);
    if principal >= I256::zero() {
        let supply = present_value_supply(supply_index, principal.try_into().unwrap());
        (supply, 0)
    } else {
        let borrow = present_value_borrow(borrow_index, principal.wrapping_neg().try_into().unwrap());
        (0, borrow)
    }
}

/// This function calculates the accrued interest indices for base token supply and borrows. 
/// It updates the base supply and borrow indices based on the current timestamp and the 
/// timestamp of the last accrual.
///
/// # Arguments
/// * `now`: [u256] - The current timestamp.
/// * `last_accrual_time`: [u256] - The timestamp of the last accrual.
///
/// # Returns
/// * [u256] - The updated base token supply index (18 decimals).
/// * [u256] - The updated base token borrow index (18 decimals).
///
/// # Number of Storage Accesses
/// * Reads: `between 8 and 14`
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

    (base_supply_index, base_borrow_index)
}

/// This function checks if the dollar value of the user's collateral, multiplied by the borrow 
/// collateral factor, is greater than the planned loan amount. 
/// It determines whether the user's collateral is sufficient to cover the desired borrow amount.
///
/// # Arguments
/// * `account`: [Identity] - The account of the user whose collateral is being checked.
///
/// # Returns
/// * [bool] - Returns `true` if the user's collateral sufficiently covers the borrow amount, `false` otherwise.
///
/// # Number of Storage Accesses
/// * Reads: `4 + storage.collateral_configurations_keys.len() * 4`
#[storage(read)]
fn is_borrow_collateralized(account: Identity) -> bool {
    let principal = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default()).principal; // decimals: base_asset_decimal

    if principal >= I256::zero() {
        return true
    };

    let present = present_value(principal); // decimals: base_token_decimals
    let mut borrow_limit: u256 = 0;

    let mut index = 0;
    let len = storage.collateral_configurations_keys.len();

    while index < len {
        let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();

        let balance: u256 = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0).into(); // decimals: collateral_configuration.decimals

        if balance == 0 {
            index += 1;
            continue;
        }

        let price = get_price_internal(collateral_configuration.price_feed_id, PricePosition::LowerBound); // decimals: price.exponent decimals
        let price_scale = u256::from(10_u64).pow(price.exponent);
        let price = u256::from(price.price); // decimals: price.exponent
        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
        let base_scale = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals);

        let amount = balance * price / price_scale; // decimals: collateral_configuration.decimals
        borrow_limit += amount * collateral_configuration.borrow_collateral_factor * base_scale / FACTOR_SCALE_18 / collateral_scale; // decimals: base_token_decimals
        index += 1;
    }

    let base_token_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id, PricePosition::Middle); // decimals: base_token_price.exponent 
    let base_token_price_scale = u256::from(10_u64).pow(base_token_price.exponent);
    let base_token_price = u256::from(base_token_price.price);
    let borrow_amount = u256::try_from(present.wrapping_neg()).unwrap() * base_token_price / base_token_price_scale; // decimals: base_token_decimals
    
    borrow_amount <= borrow_limit
}

/// This function checks whether an account has enough collateral to avoid liquidation.
/// It calculates the present value of the account's debt and compares it to the liquidation threshold,
/// which is based on the value of the collateral provided by the account.
///
/// # Arguments
/// * `account`: [Identity] - The account to be checked for liquidation risk.
///
/// # Returns
/// * [bool] - Returns `true` if the account is liquidatable, `false` otherwise.
///
/// # Number of Storage Accesses
/// * Reads: `4 + storage.collateral_configurations_keys.len() * 4`
#[storage(read)]
fn is_liquidatable_internal(account: Identity, present: I256) -> bool {
    if present >= I256::zero() {
        return false
    };

    let present: u256 = present.wrapping_neg().try_into().unwrap(); // decimals: base_token_decimals

    let mut liquidation_treshold: u256 = 0;

    let mut index = 0;
    let len = storage.collateral_configurations_keys.len();

    while index < len {
        let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();

        let balance: u256 = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0).into(); // decimals: collateral_configuration.decimals

        if balance == 0 {
            index += 1;
            continue;
        }

        let price = get_price_internal(collateral_configuration.price_feed_id, PricePosition::LowerBound); // decimals: price.exponent
        let price_scale = u256::from(10.pow(price.exponent));
        let price = u256::from(price.price); // decimals: price.exponent
        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
        let base_scale = u256::from(10_u64).pow(storage.market_configuration.read().base_token_decimals);

        let amount = balance * price / price_scale; // decimals: collateral_configuration.decimals
        liquidation_treshold += amount * collateral_configuration.liquidate_collateral_factor * base_scale / FACTOR_SCALE_18 / collateral_scale; // decimals: base_token_decimals
        index += 1;
    }

    let base_token_price = get_price_internal(storage.market_configuration.read().base_token_price_feed_id, PricePosition::Middle); // decimals: base_token_price.exponent
    let base_token_price_scale = u256::from(10_u64).pow(base_token_price.exponent);
    let base_token_price = u256::from(base_token_price.price); // decimals: base_token_price.exponent
    let borrow_amount = present * base_token_price / base_token_price_scale; // decimals: base_token_decimals

    borrow_amount > liquidation_treshold
}

/// This function calculates and returns the collateral reserves of a specific asset.
/// It subtracts the total collateral supplied from the current balance of the asset.
///
/// # Arguments
/// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
///
/// # Returns
/// * [I256] - The reserves of the collateral asset, expressed in asset decimals.
///
/// # Number of Storage Accesses
/// * Reads: `1`
#[storage(read)]
fn get_collateral_reserves_internal(asset_id: AssetId) -> I256 {
    I256::try_from(u256::from(this_balance(asset_id))).unwrap() - I256::try_from(u256::from(storage.totals_collateral.get(asset_id).try_read().unwrap_or(0))).unwrap()
}

/// This function calculates and returns the total amount of protocol reserves of the base asset.
/// It takes into account the current balance, the total supply, and the total borrow values, 
/// adjusted by the accrued interest indices.
///
/// # Returns
/// * [I256] - The reserves of the base asset, expressed in base token decimals.
///
/// # Number of Storage Accesses
/// * Reads: `3`
#[storage(read)]
fn get_reserves_internal() -> I256 {
    let market_basic = storage.market_basic.read();

    let (base_supply_index, base_borrow_index) = accrued_interest_indices(timestamp().into(), market_basic.last_accrual_time); // decimals: (18, 18)
    let balance = this_balance(storage.market_configuration.read().base_token); // decimals: base_token_decimals
    let total_supply = present_value_supply(base_supply_index, market_basic.total_supply_base); // decimals: base_token_decimals
    let total_borrow = present_value_borrow(base_borrow_index, market_basic.total_borrow_base); // decimals: base_token_decimals
    I256::try_from(u256::from(balance)).unwrap() - I256::try_from(total_supply).unwrap() + I256::try_from(total_borrow).unwrap()
}

/// This function accrues interest on the base supply and borrow indices.
/// It updates the market's supply and borrow indices based on the elapsed time since the last accrual,
/// and adjusts the tracking indices for reward calculations.
///
/// # Reverts
/// * The function assumes all calculations succeed without explicitly handling errors.
///
/// # Number of Storage Accesses
/// * Reads: `3`
/// * Writes: `1`
#[storage(write)]
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
    }
}

/// This function updates the user's base principal and accrues interest based on changes in balance.
/// It updates the reward variables (base tracking index and accrued interest) for the user.
/// # Arguments
/// * `account`: [Identity] - The account of the user.
/// * `basic`: [UserBasic] - The user's basic information, including current principal and tracking details.
/// * `principal_new`: [I256] - The new principal value that the user holds.
///
/// # Number of Storage Accesses
/// * Reads: `3`
/// * Writes: `1`
#[storage(write)]
fn update_base_principal(account: Identity, basic: UserBasic, principal_new: I256) {
    let market_basic = storage.market_basic.read();
    let market_configuration = storage.market_configuration.read();

    let principal = basic.principal;
    let mut basic = basic;
    basic.principal = principal_new;

    let accrual_descale_factor: u256 = u256::from(10_u64).pow(market_configuration.base_token_decimals) / BASE_ACCRUAL_SCALE;
    // Calculate accrued base interest
    if principal >= I256::zero() {
        let index_delta: u256 = market_basic.tracking_supply_index - basic.base_tracking_index;
        let base_tracking_accrued_delta = index_delta * principal.try_into().unwrap() / market_configuration.base_tracking_index_scale / accrual_descale_factor;
        basic.base_tracking_accrued += base_tracking_accrued_delta;
    } else {
        let index_delta: u256 = market_basic.tracking_borrow_index - basic.base_tracking_index;
        let base_tracking_accrued_delta = index_delta * principal.wrapping_neg().try_into().unwrap() / market_configuration.base_tracking_index_scale / accrual_descale_factor;
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
        account,
        user_basic: basic,
    });
}

/// This function calculates the repay and supply amounts based on changes in principal values.
/// If the `new_principal` is less than the `old_principal`, no repayment or supply is assumed.
/// If the `new_principal` is zero or negative, it calculates the repay amount.
/// If both principals are zero or positive, it calculates the supply amount.
///
/// # Arguments
/// * `old_principal`: [I256] - The principal before the change.
/// * `new_principal`: [I256] - The principal after the change.
///
/// # Returns
/// * [u256] - The amount of base asset to be repaid.
/// * [u256] - The amount of base asset to be supplied.
///
/// # Reverts
/// * The function does not handle reverts directly but assumes all conversions with `try_into()` and `unwrap()` succeed.
fn repay_and_supply_amount(old_principal: I256, new_principal: I256) -> (u256, u256) {
    // If the new principal is less than the old principal, then no amount has been repaid or supplied
    if new_principal < old_principal {
        return (u256::zero(), u256::zero())
    };

    if new_principal <= I256::zero() {
        return ((new_principal - old_principal).try_into().unwrap(), u256::zero());
    } else if old_principal >= I256::zero() {
        return (u256::zero(), (new_principal - old_principal).try_into().unwrap());
    } else {
        return (
            old_principal.wrapping_neg().try_into().unwrap(),
            new_principal.try_into().unwrap(),
        );
    }
}

/// This function calculates the withdrawn and borrowed amounts based on changes in principal values.
/// If the `new_principal` is greater than the `old_principal`, it assumes no withdrawal or borrowing occurred.
/// If the `new_principal` is zero or positive, it calculates the withdrawal amount.
/// If both principals are zero or negative, it calculates the borrowing amount.
///
/// # Arguments
/// * `old_principal`: [I256] - The previous principal amount before any change.
/// * `new_principal`: [I256] - The updated principal amount after any withdrawal or borrowing.
///
/// # Returns
/// * [u256] - The amount withdrawn, if applicable.
/// * [u256] - The amount borrowed, if applicable.
///
/// # Reverts
/// * The function does not handle reverts directly but assumes all conversions with `try_into()` and `unwrap()` succeed.
fn withdraw_and_borrow_amount(old_principal: I256, new_principal: I256) -> (u256, u256) {
    // If the new principal is greater than the old principal, then no amount has been withdrawn or borrowed
    if new_principal > old_principal {
        return (u256::zero(), u256::zero())
    };

    if new_principal >= I256::zero() {
        return ((old_principal - new_principal).try_into().unwrap(), u256::zero());
    } else if old_principal <= I256::zero() {
        return (u256::zero(), (old_principal - new_principal).try_into().unwrap());
    } else {
        return (
            old_principal.try_into().unwrap(),
            new_principal.wrapping_neg().try_into().unwrap(),
        );
    }
}

/// This function calculates the quote for collateral by considering the asset price, base price, and discount factors based on the collateral configuration.
///
/// # Arguments
/// * `asset_id`: [AssetId] - The asset ID of the collateral asset.
/// * `base_amount`: [u64] - The amount of base asset for which the quote is requested.
///
/// # Returns
/// * [u64] - The quote for the collateral asset in exchange for the base asset.
///
/// # Reverts
/// * When the conversion from `u256` to `u64` fails due to overflow.
///
/// # Number of Storage Accesses
/// * Reads: `2`
#[storage(read)]
fn quote_collateral_internal(asset_id: AssetId, base_amount: u64) -> u64 {
    let collateral_configuration = storage.collateral_configurations.get(asset_id).read();
    let market_configuration = storage.market_configuration.read();

    // Get the asset price
    let asset_price = get_price_internal(collateral_configuration.price_feed_id, PricePosition::UpperBound); // decimals: asset_price.exponent
    let asset_price_scale = u256::from(10_u64).pow(asset_price.exponent);
    let asset_price = u256::from(asset_price.price); // decimals: asset_price.exponent

    // Get the base token price
    let base_price = get_price_internal(market_configuration.base_token_price_feed_id, PricePosition::Middle); // decimals: base_price.exponent 
    let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
    let base_price = u256::from(base_price.price); // decimals: base_price.exponent 
    let discount_factor: u256 = market_configuration.store_front_price_factor * (FACTOR_SCALE_18 - collateral_configuration.liquidation_penalty) / FACTOR_SCALE_18; // decimals: 18
    let asset_price_discounted: u256 = asset_price * (FACTOR_SCALE_18 - discount_factor) / FACTOR_SCALE_18; // decimals: asset_price.exponent
    let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);
    let base_scale = u256::from(10_u64).pow(market_configuration.base_token_decimals);

    let value = base_price * base_amount.into() / base_scale; // decimals: base_price.exponent
    let quote = value * asset_price_scale * collateral_scale / asset_price_discounted / base_price_scale; // decimals: collateral_configuration.decimals

    // Native assets are in u64
    <u64 as TryFrom<u256>>::try_from(quote).unwrap()
}

/// This function retrieves the user's balance, including accrued interest.
///
/// # Arguments
/// * `account`: [Identity] - The account of the user.
///
/// # Returns
/// * [I256] - The user balance (with included interest).
///
/// # Number of Storage Accesses
/// * Reads: `2`
#[storage(read)]
fn get_user_balance_with_interest_internal(account: Identity) -> I256 {
    let mut user_basic = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default());
    let last_accrual_time = storage.market_basic.last_accrual_time.read();

    // Calculate new indices
    let (supply_index, borrow_index) = accrued_interest_indices(timestamp().into(), last_accrual_time);

    // Return the present value of the user's balance
    if user_basic.principal >= I256::zero() {
        I256::try_from(present_value_supply(supply_index, user_basic.principal.try_into().unwrap())).unwrap()
    } else {
        I256::try_from(present_value_borrow(
            borrow_index,
            user_basic
                .principal
                .wrapping_neg()
                .try_into()
                .unwrap(),
        )).unwrap().wrapping_neg()
    }
}

/// This function absorbs the collateral from a liquidated account, transferring it to the protocol and settling the account's debt.
///
/// # Arguments
/// * `account`: [Identity] - The account to be absorbed.
///
/// # Reverts
/// * When the account is not liquidatable.
///
/// # Number of Storage Accesses
/// * Reads: `8 + storage.collateral_configurations_keys.len() * 5`
/// * Writes: `2 + storage.collateral_configurations_keys.len() * 2`
#[storage(write)]
fn absorb_internal(account: Identity) {
    // Get the user's basic information
    let user_basic = storage.user_basic.get(account).try_read().unwrap_or(UserBasic::default());
    let old_principal = user_basic.principal;
    let old_balance = present_value(old_principal); // decimals: base_token_decimals
    
    // Check that the account is liquidatable
    require(is_liquidatable_internal(account, old_balance), Error::NotLiquidatable);

    let mut delta_value: u256 = 0; // decimals: 18
    let market_configuration = storage.market_configuration.read();

    let caller = msg_sender().unwrap();

    // Only used for logging event
    let mut total_value: u256 = 0; // decimals: 18
    let mut index = 0;
    let len = storage.collateral_configurations_keys.len();

    while index < len {
        let collateral_configuration = storage.collateral_configurations.get(storage.collateral_configurations_keys.get(index).unwrap().read()).read();
        let seize_amount = storage.user_collateral.get((account, collateral_configuration.asset_id)).try_read().unwrap_or(0); // decimals: collateral_asset_decimals

        // If the user has no collateral of the asset, skip to the next asset
        if seize_amount == 0 {
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
        let price = get_price_internal(collateral_configuration.price_feed_id, PricePosition::LowerBound); // decimals: price.exponent
        let price_exponent = price.exponent;
        let price_scale = u256::from(10_u64).pow(price.exponent);
        let price = u256::from(price.price); // decimals: price.exponent
        let collateral_scale = u256::from(10_u64).pow(collateral_configuration.decimals);

        // Apply liquidation penalty to the seized amount
        delta_value += price * seize_amount.into() * collateral_configuration.liquidation_penalty / collateral_scale / price_scale; // decimals: 18
        index += 1;

        // Total value of seized collateral with liquidation penalty
        total_value += price * seize_amount.into() * FACTOR_SCALE_18 / collateral_scale / price_scale; // decimals: 18
        let seize_value = price * seize_amount.into() / collateral_scale; // decimals: price.exponent

        // Emit absorb collateral event
        log(AbsorbCollateralEvent {
            account,
            asset_id: collateral_configuration.asset_id,
            amount: seize_amount, // decimals: collateral_asset_decimals
            seize_value, // decimals: price.exponent
            decimals: price_exponent,
        });
    }

    // Get the base token price
    let base_price = get_price_internal(market_configuration.base_token_price_feed_id, PricePosition::Middle); // decimals: base_token_price.exponent
    let base_price_exponent = base_price.exponent;
    let base_price_scale = u256::from(10_u64).pow(base_price.exponent);
    let base_price = u256::from(base_price.price); // decimals: base_token_price.exponent
    let base_scale = (u256::from(10_u64)).pow(market_configuration.base_token_decimals);

    // Calculate the new balance of the user
    let delta_balance = delta_value * base_price_scale * base_scale / base_price / FACTOR_SCALE_18; // decimals: base_token_decimals
    let delta_balance_value = delta_balance * base_price / base_scale; // decimals: price.exponent
    let mut new_balance = old_balance + I256::try_from(delta_balance).unwrap(); // decimals: base_token_decimals
    if new_balance < I256::zero() {
        new_balance = I256::zero();
    }

    // Calculate the new principal value of the user
    let new_principal = principal_value(new_balance);
    update_base_principal(account, user_basic, new_principal);

    // Calculate the repay and supply amounts
    let (repay_amount, supply_amount) = repay_and_supply_amount(old_principal, new_principal);

    // Reserves are decreased by increasing total supply and decreasing borrows
    // the amount of debt repaid by reserves is `newBalance - oldBalance`
    let mut market_basic = storage.market_basic.read();
    market_basic.total_supply_base += supply_amount;
    market_basic.total_borrow_base -= repay_amount;
    storage.market_basic.write(market_basic);

    // Emit market basic event
    log(MarketBasicEvent { market_basic });

    let total_base = total_value * base_price_scale * base_scale / base_price / FACTOR_SCALE_18; // decimals: base_token_decimals
    let total_base_value = total_base * base_price / base_scale; // decimals: price.exponent

    // Emit user liquidated event
    log(UserLiquidatedEvent {
        account,
        liquidator: caller,
        base_paid_out: delta_balance,
        base_paid_out_value: delta_balance_value,
        total_base,
        total_base_value,
        decimals: base_price_exponent,
    });
}
