library;

use i256::I256;
use std::constants::ZERO_B256;

pub const BASE_ACCRUAL_SCALE: u256 = 1_000_000; // 1e6
pub const BASE_INDEX_SCALE_15: u256 = 1_000_000_000_000_000; // 1e15
pub const FACTOR_SCALE_18: u256 = 1_000_000_000_000_000_000; // 1e18

pub struct CollateralConfiguration {
    pub asset_id: b256,
    pub price_feed_id: b256,
    pub decimals: u32,
    pub borrow_collateral_factor: u256, // decimals: 18
    pub liquidate_collateral_factor: u256, // decimals: 18
    pub liquidation_penalty: u256, // decimals: 18
    pub supply_cap: u256, // decimals: asset decimals
    pub paused: bool,
}

pub struct MarketConfiguration {
    pub governor: Address,
    pub pause_guardian: Address,
    pub base_token: b256,
    pub base_token_decimals: u32,
    pub base_token_price_feed_id: b256,
    pub supply_kink: u256, // decimals: 18
    pub borrow_kink: u256, // decimals: 18
    pub supply_per_second_interest_rate_slope_low: u256, // decimals: 18
    pub supply_per_second_interest_rate_slope_high: u256, // decimals: 18
    pub supply_per_second_interest_rate_base: u256, // decimals: 18
    pub borrow_per_second_interest_rate_slope_low: u256, // decimals: 18
    pub borrow_per_second_interest_rate_slope_high: u256, // decimals: 18
    pub borrow_per_second_interest_rate_base: u256, // decimals: 18
    pub store_front_price_factor: u256, // decimals: 18
    pub base_tracking_index_scale: u256, // decimals: 15
    pub base_tracking_supply_speed: u256, // decimals: 15
    pub base_tracking_borrow_speed: u256, // decimals: 15
    pub base_min_for_rewards: u256, // decimals: base_token_decimals
    pub base_borrow_min: u256, // decimals: base_token_decimals
    pub target_reserves: u256, // decimals: base_token_decimals
}

impl MarketConfiguration {
    pub fn default() -> Self {
        MarketConfiguration {
            governor: Address::from(ZERO_B256),
            pause_guardian: Address::from(ZERO_B256),
            base_token: ZERO_B256,
            base_token_decimals: 0,
            base_token_price_feed_id: ZERO_B256,
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

pub struct PauseConfiguration {
    pub supply_paused: bool,
    pub withdraw_paused: bool,
    pub absorb_paused: bool,
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

pub struct UserBasic {
    pub principal: I256, // decimals: base_asset_decimal
    pub base_tracking_index: u256, // decimals: 15
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

pub struct MarketBasics {
    pub base_supply_index: u256, // decimals: 15
    pub base_borrow_index: u256, // decimals: 15
    pub tracking_supply_index: u256, // decimals: 15
    pub tracking_borrow_index: u256, // decimals: 15
    pub total_supply_base: u256, // decimals: base_asset_decimal
    pub total_borrow_base: u256, // decimals: base_asset_decimal
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
}
