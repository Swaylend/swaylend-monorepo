import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * JSON parser that keeps integer literals > Number.MAX_SAFE_INTEGER as strings.
 *
 * The market configs contain values like 800000000000000000 (8e17) for kink
 * factors that overflow JS `number`. The on-chain ABI expects `BigNumberish`
 * which accepts strings, so we route them through as strings here.
 */
function losslessParse(text: string): any {
  // Replace any integer literal not already in a string with a quoted form,
  // but only if it exceeds Number.MAX_SAFE_INTEGER (2^53 - 1).
  const safe = Number.MAX_SAFE_INTEGER;
  const wrapped = text.replace(/(?<![\w."])(-?\d{16,})(?![\w."])/g, (_, num) => {
    const big = BigInt(num);
    if (big <= BigInt(safe) && big >= -BigInt(safe)) return num;
    return `"${num}"`;
  });
  return JSON.parse(wrapped);
}

export interface PauseConfiguration {
  supply_paused: boolean;
  withdraw_paused: boolean;
  absorb_paused: boolean;
  buy_paused: boolean;
}

export interface BaseAssetConfig {
  asset_id: string;
  price_feed_id: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface CollateralAssetConfig extends BaseAssetConfig {
  borrow_collateral_factor: string | number;
  liquidate_collateral_factor: string | number;
  liquidation_penalty: string | number;
  supply_cap: string | number;
  is_active: boolean;
}

export interface MarketConfigJson extends PauseConfiguration {
  supply_kink: string | number;
  borrow_kink: string | number;
  supply_per_second_interest_rate_slope_low: string | number;
  supply_per_second_interest_rate_slope_high: string | number;
  supply_per_second_interest_rate_base: string | number;
  borrow_per_second_interest_rate_slope_low: string | number;
  borrow_per_second_interest_rate_slope_high: string | number;
  borrow_per_second_interest_rate_base: string | number;
  store_front_price_factor: string | number;
  base_tracking_index_scale: string | number;
  base_tracking_supply_speed: string | number;
  base_tracking_borrow_speed: string | number;
  base_min_for_rewards: string | number;
  base_borrow_min: string | number;
  target_reserves: string | number;
  pyth_contract_id: string;
  base_asset: BaseAssetConfig;
  collateral_assets: CollateralAssetConfig[];
}

export function readMarketConfig(path: string): MarketConfigJson {
  const abs = resolve(path);
  return losslessParse(readFileSync(abs, 'utf-8')) as MarketConfigJson;
}
