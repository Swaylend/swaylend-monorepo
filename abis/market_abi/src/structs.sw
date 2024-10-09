library;

use sway_libs::signed_integers::i256::I256;
use std::bytes::Bytes;
use pyth_interface::{data_structures::price::{PriceFeedId}};

pub const BASE_ACCRUAL_SCALE: u256 = 1_000_000; // 1e6
pub const BASE_INDEX_SCALE_15: u256 = 1_000_000_000_000_000; // 1e15
pub const FACTOR_SCALE_18: u256 = 1_000_000_000_000_000_000; // 1e18
pub const ORACLE_CONF_BASIS_POINTS: u256 = 10_000; // 1e4

/// This struct contains the configuration details for collateral management.
pub struct CollateralConfiguration {
    /// This field represents the ID of the asset.
    pub asset_id: AssetId,
    /// This field holds the price feed ID for the asset.
    pub price_feed_id: b256,
    /// This field represents the number of decimals for the asset.
    pub decimals: u32,
    /// This field represents the collateral factor for borrowing.
    pub borrow_collateral_factor: u256, // decimals: 18
    /// This field represents the collateral factor for liquidation.
    pub liquidate_collateral_factor: u256, // decimals: 18
    /// This field represents the penalty incurred during liquidation.
    pub liquidation_penalty: u256, // decimals: 18
    /// This field represents the supply cap for the asset.
    pub supply_cap: u64, // decimals: asset decimals
    /// This field indicates whether the collateral is paused.
    pub paused: bool,
}

/// This struct contains the configuration details for a market.
pub struct MarketConfiguration {
    /// This field represents the ID of the base token asset.
    pub base_token: AssetId,
    /// This field represents the number of decimals for the base token.
    pub base_token_decimals: u32,
    /// This field holds the price feed ID for the base token.
    pub base_token_price_feed_id: b256,
    /// This field represents the supply kink.
    pub supply_kink: u256, // decimals: 18
    /// This field represents the borrow kink.
    pub borrow_kink: u256, // decimals: 18
    /// This field holds the low slope of the per-second supply interest rate.
    pub supply_per_second_interest_rate_slope_low: u256, // decimals: 18
    /// This field holds the high slope of the per-second supply interest rate.
    pub supply_per_second_interest_rate_slope_high: u256, // decimals: 18
    /// This field represents the base per-second supply interest rate.
    pub supply_per_second_interest_rate_base: u256, // decimals: 18
    /// This field holds the low slope of the per-second borrow interest rate.
    pub borrow_per_second_interest_rate_slope_low: u256, // decimals: 18
    /// This field holds the high slope of the per-second borrow interest rate.
    pub borrow_per_second_interest_rate_slope_high: u256, // decimals: 18
    /// This field represents the base per-second borrow interest rate.
    pub borrow_per_second_interest_rate_base: u256, // decimals: 18
    /// This field holds the store front price factor.
    pub store_front_price_factor: u256, // decimals: 18
    /// This field represents the scale of the base tracking index.
    pub base_tracking_index_scale: u256, // decimals: 15
    /// This field holds the speed at which the base is tracked for supply.
    pub base_tracking_supply_speed: u256, // decimals: 15
    /// This field holds the speed at which the base is tracked for borrowing.
    pub base_tracking_borrow_speed: u256, // decimals: 15
    /// This field represents the minimum base required to earn rewards.
    pub base_min_for_rewards: u256, // decimals: base_asset_decimals
    /// This field represents the minimum base that can be borrowed.
    pub base_borrow_min: u256, // decimals: base_asset_decimals
    /// This field holds the target reserves.
    pub target_reserves: u256, // decimals: base_asset_decimals
}

impl MarketConfiguration {
    pub fn default() -> Self {
        MarketConfiguration {
            base_token: AssetId::zero(),
            base_token_decimals: 0,
            base_token_price_feed_id: b256::zero(),
            supply_kink: 0,
            borrow_kink: 0,
            supply_per_second_interest_rate_slope_low: 0,
            supply_per_second_interest_rate_slope_high: 0,
            supply_per_second_interest_rate_base: 0,
            borrow_per_second_interest_rate_slope_low: 0,
            borrow_per_second_interest_rate_slope_high: 0,
            borrow_per_second_interest_rate_base: 0,
            store_front_price_factor: 0,
            base_tracking_index_scale: 0,
            base_tracking_supply_speed: 0,
            base_tracking_borrow_speed: 0,
            base_min_for_rewards: 0,
            base_borrow_min: 0,
            target_reserves: 0,
        }
    }
}

/// This struct defines the configuration for pausing various market actions.
pub struct PauseConfiguration {
    /// This field indicates whether supply actions are paused.
    pub supply_paused: bool,
    /// This field indicates whether withdrawal actions are paused.
    pub withdraw_paused: bool,
    /// This field indicates whether absorption actions are paused.
    pub absorb_paused: bool,
    /// This field indicates whether buy actions are paused.
    pub buy_paused: bool,
}

impl PauseConfiguration {
    pub fn default() -> Self {
        PauseConfiguration {
            supply_paused: true,
            withdraw_paused: true,
            absorb_paused: true,
            buy_paused: true,
        }
    }
}

/// This struct contains basic user information related to a market.
pub struct UserBasic {
    /// This field represents the user's principal amount.
    pub principal: I256, // decimals: base_asset_decimals
    /// This field represents the user's base tracking index.
    pub base_tracking_index: u256, // decimals: 15
    /// This field holds the accrued base tracking value.
    pub base_tracking_accrued: u256, // decimals: base_accrual_scale
}

impl UserBasic {
    pub fn default() -> Self {
        UserBasic {
            principal: I256::new(),
            base_tracking_index: 0,
            base_tracking_accrued: 0,
        }
    }
}

/// This struct contains the basic information about a market.
pub struct MarketBasics {
    /// This field represents the supply index of the base asset.
    pub base_supply_index: u256, // decimals: 15
    /// This field represents the borrow index of the base asset.
    pub base_borrow_index: u256, // decimals: 15
    /// This field represents the supply index for tracking.
    pub tracking_supply_index: u256, // decimals: 15
    /// This field represents the borrow index for tracking.
    pub tracking_borrow_index: u256, // decimals: 15
    /// This field holds the total supply of the base asset.
    pub total_supply_base: u256, // decimals: base_asset_decimals
    /// This field holds the total borrowed amount of the base asset.
    pub total_borrow_base: u256, // decimals: base_asset_decimals
    /// This field contains the timestamp of the last accrual event.
    pub last_accrual_time: u256,
}

impl MarketBasics {
    pub fn default() -> Self {
        MarketBasics {
            base_supply_index: BASE_INDEX_SCALE_15,
            base_borrow_index: BASE_INDEX_SCALE_15,
            tracking_supply_index: 0,
            tracking_borrow_index: 0,
            total_supply_base: 0,
            total_borrow_base: 0,
            last_accrual_time: 0,
        }
    }
}

/// This struct contains data necessary for updating price feeds.
pub struct PriceDataUpdate {
    /// This field represents the fee required to perform the update.
    pub update_fee: u64,
    /// This field contains a list of times when price feeds were published.
    pub publish_times: Vec<u64>,
    /// This field holds a collection of identifiers for the price feeds being updated.
    pub price_feed_ids: Vec<PriceFeedId>,
    /// This field includes the actual update data in bytes format.
    pub update_data: Vec<Bytes>,
}

pub enum PricePosition {
    LowerBound: (),
    Middle: (),
    UpperBound: (),
}

impl core::ops::Eq for PricePosition {
    fn eq(self, other: Self) -> bool {
        match (self, other) {
            (PricePosition::LowerBound, PricePosition::LowerBound) => true,
            (PricePosition::Middle, PricePosition::Middle) => true,
            (PricePosition::UpperBound, PricePosition::UpperBound) => true,
            _ => false,
        }
    }
}

pub enum Error {
    AlreadyInitialized: (),
    Paused: (),
    Unauthorized: (),
    InsufficientReserves: (),
    NotLiquidatable: (),
    NotForSale: (),
    TooMuchSlippage: (),
    SupplyCapExceeded: (),
    NotCollateralized: (),
    BorrowTooSmall: (),
    NotPermitted: (),
    InvalidPayment: (),
    UnknownAsset: (),
    DebuggingDisabled: (),
    NotYetActive: (),
    AlreadyActive: (),
    OracleContractIdNotSet: (),
    OraclePriceValidationError: (),
}
