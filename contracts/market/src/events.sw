library;

use market_abi::structs::*;

// Collateral Asset Events

/// This struct represents an event when a collateral asset is added.
pub struct CollateralAssetAdded {
    /// This field represents the ID of the asset being added.
    pub asset_id: AssetId,
    /// This field holds the configuration details for the collateral asset.
    pub configuration: CollateralConfiguration,
}

/// This struct represents an event when a collateral asset is updated.
pub struct CollateralAssetUpdated {
    /// This field represents the ID of the asset being updated.
    pub asset_id: AssetId,
    /// This field holds the updated configuration details for the collateral asset.
    pub configuration: CollateralConfiguration,
}

/// This struct represents an event when a collateral asset is paused.
pub struct CollateralAssetPaused {
    /// This field represents the ID of the asset that is paused.
    pub asset_id: AssetId,
}

/// This struct represents an event when a collateral asset is resumed.
pub struct CollateralAssetResumed {
    /// This field represents the ID of the asset that is resumed.
    pub asset_id: AssetId,
}

// User Basic Event
/// This struct represents an event related to a user's basic information.
pub struct UserBasicEvent {
    /// This field represents the identity of the user account.
    pub account: Identity,
    /// This field holds the basic information of the user.
    pub user_basic: UserBasic,
}

// Market Basic Event
/// This struct represents an event related to the basic information of a market.
pub struct MarketBasicEvent {
    /// This field holds the basic information of the market.
    pub market_basic: MarketBasics,
}

// User Collateral Events
/// This struct represents an event when a user supplies collateral.
pub struct UserSupplyCollateralEvent {
    /// This field represents the identity of the user account.
    pub account: Identity,
    /// This field represents the ID of the asset being supplied as collateral.
    pub asset_id: AssetId,
    /// This field represents the amount of collateral being supplied.
    pub amount: u64,
}

/// This struct represents an event when a user withdraws collateral.
pub struct UserWithdrawCollateralEvent {
    /// This field represents the identity of the user account.
    pub account: Identity,
    /// This field represents the ID of the asset being withdrawn as collateral.
    pub asset_id: AssetId,
    /// This field represents the amount of collateral being withdrawn.
    pub amount: u64,
}

// User Base Asset Events
/// This struct represents an event when a user supplies base assets.
pub struct UserSupplyBaseEvent {
    /// This field represents the identity of the user account.
    pub account: Identity,
    /// This field represents the amount of base assets being supplied.
    pub supply_amount: u256,
    /// This field represents the amount of base assets being repaid.
    pub repay_amount: u256,
}

/// This struct represents an event when a user withdraws base assets.
pub struct UserWithdrawBaseEvent {
    /// This field represents the identity of the user account.
    pub account: Identity,
    /// This field represents the amount of base assets being withdrawn.
    pub withdraw_amount: u256,
    /// This field represents the amount of base assets being borrowed.
    pub borrow_amount: u256,
}

// Liquidation Events
/// This struct represents an event when collateral is absorbed.
pub struct AbsorbCollateralEvent {
    /// This field represents the identity of the user account.
    pub account: Identity,
    /// This field represents the ID of the asset being absorbed.
    pub asset_id: AssetId,
    /// This field represents the amount of collateral being absorbed.
    pub amount: u64,
    /// This field represents the value of the seized collateral.
    pub seize_value: u256,
    /// This field represents the number of decimals for the asset.
    pub decimals: u32,
}

/// This struct represents an event when a user is liquidated.
pub struct UserLiquidatedEvent {
    /// This field represents the identity of the user account being liquidated.
    pub account: Identity,
    /// This field represents the identity of the liquidator.
    pub liquidator: Identity,
    /// This field represents the amount of base assets paid out during liquidation.
    pub base_paid_out: u256,
    /// This field represents the value of the base assets paid out during liquidation.
    pub base_paid_out_value: u256,
    /// This field represents the total amount of base assets involved in the liquidation.
    pub total_base: u256,
    /// This field represents the total value of the base assets involved in the liquidation.
    pub total_base_value: u256,
    /// This field represents the number of decimals for the base asset.
    pub decimals: u32,
}

// Buy Collateral Event
/// This struct represents an event when collateral is bought.
pub struct BuyCollateralEvent {
    /// This field represents the identity of the caller initiating the buy.
    pub caller: Identity,
    /// This field represents the identity of the recipient receiving the collateral.
    pub recipient: Identity,
    /// This field represents the ID of the asset being bought.
    pub asset_id: AssetId,
    /// This field represents the amount of collateral being bought.
    pub amount: u64,
    /// This field represents the price of the collateral being bought.
    pub price: u64,
}

// Reserves Withdrawn Event
/// This struct represents an event when reserves are withdrawn.
pub struct ReservesWithdrawnEvent {
    /// This field represents the identity of the caller initiating the withdrawal.
    pub caller: Identity,
    /// This field represents the identity of the recipient receiving the withdrawn reserves.
    pub to: Identity,
    /// This field represents the amount of reserves being withdrawn.
    pub amount: u64,
}

// Pause configuration event
/// This struct represents an event related to the pause configuration.
pub struct PauseConfigurationEvent {
    /// This field holds the pause configuration details.
    pub pause_config: PauseConfiguration,
}

// Market configuration event
/// This struct represents an event related to the market configuration.
pub struct MarketConfigurationEvent {
    /// This field holds the market configuration details.
    pub market_config: MarketConfiguration,
}

// Set pyth contract id event
pub struct SetPythContractIdEvent {
    pub contract_id: ContractId,
}
