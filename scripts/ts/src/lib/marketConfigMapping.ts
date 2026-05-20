/**
 * Maps the on-disk JSON config (scripts/configs/*.json) into the typed inputs
 * the Market contract expects.
 */

import type {
  CollateralConfigurationInput,
  MarketConfigurationInput,
  PauseConfigurationInput,
} from '../sway-api/Market';
import type { CollateralAssetConfig, MarketConfigJson } from './marketConfig';

export function toCollateralConfigurationInput(c: CollateralAssetConfig): CollateralConfigurationInput {
  return {
    asset_id: { bits: c.asset_id },
    price_feed_id: c.price_feed_id,
    decimals: c.decimals,
    borrow_collateral_factor: c.borrow_collateral_factor,
    liquidate_collateral_factor: c.liquidate_collateral_factor,
    liquidation_penalty: c.liquidation_penalty,
    supply_cap: c.supply_cap,
    // Config JSON uses `is_active` (positive); on-chain uses `paused` (inverted).
    paused: !c.is_active,
  };
}

export function toMarketConfigurationInput(c: MarketConfigJson): MarketConfigurationInput {
  return {
    base_token: { bits: c.base_asset.asset_id },
    base_token_decimals: c.base_asset.decimals,
    base_token_price_feed_id: c.base_asset.price_feed_id,
    supply_kink: c.supply_kink,
    borrow_kink: c.borrow_kink,
    supply_per_second_interest_rate_slope_low: c.supply_per_second_interest_rate_slope_low,
    supply_per_second_interest_rate_slope_high: c.supply_per_second_interest_rate_slope_high,
    supply_per_second_interest_rate_base: c.supply_per_second_interest_rate_base,
    borrow_per_second_interest_rate_slope_low: c.borrow_per_second_interest_rate_slope_low,
    borrow_per_second_interest_rate_slope_high: c.borrow_per_second_interest_rate_slope_high,
    borrow_per_second_interest_rate_base: c.borrow_per_second_interest_rate_base,
    store_front_price_factor: c.store_front_price_factor,
    base_tracking_index_scale: c.base_tracking_index_scale,
    base_tracking_supply_speed: c.base_tracking_supply_speed,
    base_tracking_borrow_speed: c.base_tracking_borrow_speed,
    base_min_for_rewards: c.base_min_for_rewards,
    base_borrow_min: c.base_borrow_min,
    target_reserves: c.target_reserves,
  };
}

export function toPauseConfigurationInput(c: MarketConfigJson): PauseConfigurationInput {
  return {
    supply_paused: c.supply_paused,
    withdraw_paused: c.withdraw_paused,
    absorb_paused: c.absorb_paused,
    buy_paused: c.buy_paused,
  };
}

/**
 * Compare any two values, treating BigNumberish/strings/numbers as equal if their
 * stringified forms match. Used to compare on-chain values (often `BN` objects)
 * against config file values (strings / numbers).
 */
export function deepEqualBN(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'object' && typeof b === 'object') {
    // BN-like: has toString()
    const aStr = (a as { toString(): string }).toString();
    const bStr = (b as { toString(): string }).toString();
    if (aStr !== '[object Object]' && bStr !== '[object Object]' && aStr === bStr) return true;
    // Recurse into plain objects
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => deepEqualBN((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return String(a) === String(b);
}
