library;

use market_abi::structs::*;

// Collateral Asset Events
pub struct CollateralAssetAdded {
    pub asset_id: AssetId,
    pub configuration: CollateralConfiguration,
}

pub struct CollateralAssetUpdated {
    pub asset_id: AssetId,
    pub configuration: CollateralConfiguration,
}

pub struct CollateralAssetPaused {
    pub asset_id: AssetId,
}

pub struct CollateralAssetResumed {
    pub asset_id: AssetId,
}

// User Basic Event
pub struct UserBasicEvent {
    pub account: Identity,
    pub user_basic: UserBasic
}

// Market Basic Event
pub struct MarketBasicEvent {
    pub market_basic: MarketBasics,
}

// User Collateral Events
pub struct UserSupplyCollateralEvent {
    pub account: Identity,
    pub asset_id: AssetId,
    pub amount: u64,
}

pub struct UserWithdrawCollateralEvent {
    pub account: Identity,
    pub asset_id: AssetId,
    pub amount: u64,
}

// User Base Asset Events
pub struct UserSupplyBaseEvent {
    pub account: Identity,
    pub supply_amount: u256,
    pub repay_amount: u256,
}

pub struct UserWithdrawBaseEvent {
    pub account: Identity,
    pub withdraw_amount: u256,
    pub borrow_amount: u256,
}

// Liquidation Events
pub struct AbsorbCollateralEvent {
    pub account: Identity,
    pub asset_id: AssetId,
    pub amount: u64,
    pub seize_value: u256,
    pub decimals: u32,
}

pub struct UserLiquidatedEvent {
    pub account: Identity,
    pub liquidator: Identity,
    pub base_paid_out: u256,
    pub base_paid_out_value: u256,
    pub total_base: u256,
    pub total_base_value: u256,
    pub decimals: u32,
}

// Buy Collateral Event
pub struct BuyCollateralEvent {
    pub caller: Identity,
    pub recipient: Identity,
    pub asset_id: AssetId,
    pub amount: u64,
    pub price: u64,
}

// Reserves Withdrawn Event
pub struct ReservesWithdrawnEvent {
    pub account: Identity,
    pub amount: u64,
}

// Pause configuration event
pub struct PauseConfigurationEvent {
    pub pause_config: PauseConfiguration,
}

// Market configuration event
pub struct MarketConfigurationEvent {
    pub market_config: MarketConfiguration,
}
