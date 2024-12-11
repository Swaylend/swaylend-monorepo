import { Wallet } from 'fuels';
import { BakoProvider, Vault } from 'bakosafe';
import { Market, UpdateMarket } from './types';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import type { MarketConfigurationInput } from './types/contracts/Market';

dotenv.config({ path: '../.env' });

type MarketConfigJSON = {
  supply_paused: boolean;
  withdraw_paused: boolean;
  absorb_paused: boolean;
  buy_paused: boolean;
  supply_kink: string;
  borrow_kink: string;
  supply_per_second_interest_rate_slope_low: number;
  supply_per_second_interest_rate_slope_high: number;
  supply_per_second_interest_rate_base: number;
  borrow_per_second_interest_rate_slope_low: number;
  borrow_per_second_interest_rate_slope_high: number;
  borrow_per_second_interest_rate_base: number;
  store_front_price_factor: string;
  base_tracking_index_scale: string;
  base_tracking_supply_speed: string;
  base_tracking_borrow_speed: string;
  base_min_for_rewards: string;
  base_borrow_min: string;
  target_reserves: string;
  pyth_contract_id: string;
  base_asset: {
    asset_id: string;
    price_feed_id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  collateral_assets: CollateralAssetConfig[];
};

type CollateralAssetConfig = {
  asset_id: string;
  price_feed_id: string;
  name: string;
  symbol: string;
  decimals: number;
  borrow_collateral_factor: number;
  liquidate_collateral_factor: number;
  liquidation_penalty: number;
  supply_cap: number;
  is_active: boolean;
};

function castConfigInto(
  config: Omit<MarketConfigJSON, 'collateral_assets'>
): MarketConfigurationInput {
  return {
    base_token: { bits: config.base_asset.asset_id },
    base_token_decimals: config.base_asset.decimals.toString(),
    base_token_price_feed_id: config.base_asset.price_feed_id,
    supply_kink: config.supply_kink.toString(),
    borrow_kink: config.borrow_kink.toString(),
    supply_per_second_interest_rate_slope_low:
      config.supply_per_second_interest_rate_slope_low.toString(),
    supply_per_second_interest_rate_slope_high:
      config.supply_per_second_interest_rate_slope_high.toString(),
    supply_per_second_interest_rate_base:
      config.supply_per_second_interest_rate_base.toString(),
    borrow_per_second_interest_rate_slope_low:
      config.borrow_per_second_interest_rate_slope_low.toString(),
    borrow_per_second_interest_rate_slope_high:
      config.borrow_per_second_interest_rate_slope_high.toString(),
    borrow_per_second_interest_rate_base:
      config.borrow_per_second_interest_rate_base.toString(),
    store_front_price_factor: config.store_front_price_factor.toString(),
    base_tracking_index_scale: config.base_tracking_index_scale.toString(),
    base_tracking_supply_speed: config.base_tracking_supply_speed.toString(),
    base_tracking_borrow_speed: config.base_tracking_borrow_speed.toString(),
    base_min_for_rewards: config.base_min_for_rewards.toString(),
    base_borrow_min: config.base_borrow_min.toString(),
    target_reserves: config.target_reserves.toString(),
  };
}

const PROVIDER_URL =
  process.env.PROVIDER_URL || 'https://testnet.fuel.network/v1/graphql';
const PRIVATE_KEY = process.env.SIGNING_KEY!;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS!;
const PROXY_CONTRACT_ID = process.env.PROXY_CONTRACT_ID!;
const TARGET_CONTRACT_ID = process.env.TARGET_CONTRACT_ID!;

const main = async () => {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error('Please provide the config path as a command-line argument.');
    process.exit(1);
  }

  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY);
  const challenge = await BakoProvider.setup({
    address: wallet.address.toB256(),
    provider: PROVIDER_URL,
  });
  const token = await wallet.signMessage(challenge);
  const provider = await BakoProvider.authenticate(PROVIDER_URL, {
    token,
    challenge,
    address: wallet.address.toB256(),
  });
  const market = new Market(PROXY_CONTRACT_ID, provider);

  const newMarketConfigObj: MarketConfigJSON = JSON.parse(
    readFileSync(configPath, 'utf8')
  );
  const { collateral_assets, ...newMarketConfig } = newMarketConfigObj;
  const normalizedNewMarketConfig = castConfigInto(newMarketConfig);

  const currMarketConfig = (
    await market.functions.get_market_configuration().get()
  ).value;

  let modifyFields = 0;
  for (const key of Object.keys(currMarketConfig)) {
    const currVal =
      key === 'base_token'
        ? currMarketConfig[key].bits
        : currMarketConfig[key].toString();
    const nextVal =
      key === 'base_token'
        ? normalizedNewMarketConfig[key].bits
        : normalizedNewMarketConfig[key].toString();

    if (currVal !== nextVal) {
      console.log(`${key}: ${currVal} -> ${nextVal}`);
      modifyFields++;
    }
  }

  const currPythId = await market.functions.get_pyth_contract_id().get();
  if (currPythId.value.bits !== newMarketConfig.pyth_contract_id) {
    console.log(
      `pyth_contract_id: ${currPythId.value.bits} -> ${newMarketConfig.pyth_contract_id}`
    );
    modifyFields++;
  }

  const currPauseConfig = await market.functions
    .get_pause_configuration()
    .get();
  const newPauseConfig = {
    supply_paused: newMarketConfig.supply_paused,
    withdraw_paused: newMarketConfig.withdraw_paused,
    absorb_paused: newMarketConfig.absorb_paused,
    buy_paused: newMarketConfig.buy_paused,
  };
  for (const key of Object.keys(newPauseConfig)) {
    if (currPauseConfig.value[key] !== newPauseConfig[key]) {
      modifyFields++;
      console.log(
        `${key}: ${currPauseConfig.value[key]} -> ${newPauseConfig[key]}`
      );
    }
  }

  const vault = await Vault.fromAddress(VAULT_ADDRESS, provider);
  const script = new UpdateMarket(vault);
  const proxyId = { bits: PROXY_CONTRACT_ID };

  const configurableConstants = {
    MARKET_CONTRACT_ID: proxyId,
  };

  if (modifyFields === 0) {
    console.log('Nothing to update');
    process.exit(0);
  }

  script.setConfigurableConstants(configurableConstants);
  const request = await script.functions
    .main(
      normalizedNewMarketConfig,
      { bits: newMarketConfig.pyth_contract_id },
      newPauseConfig
    )
    .addContracts([market])
    .getTransactionRequest();

  const { hashTxId } = await vault.BakoTransfer(request, {
    name: `Update ${modifyFields} market configs`,
  });
  console.log('Transaction ID:', hashTxId);
};

main().catch((err) => {
  console.error('Error updating market config:', err);
});
