import fuel from '/public/icons/fuel-logo.svg?url';
import btc from '/public/tokens/bitcoin.svg?url';
import eth from '/public/tokens/ethereum.svg?url';
import sway from '/public/tokens/sway.svg?url';
import uni from '/public/tokens/uni.svg?url';
import usdc from '/public/tokens/usdc.svg?url';
import usdt from '/public/tokens/usdt.svg?url';

// Contract addresses
export type MarketConfiguration = {
  oracleAddress: string;
  marketAddress: string;
  tokenFactoryAddress: string;
  graphqlUrl: string;
};

// Faucet configuration
export const FAUCET_URL = 'https://faucet-testnet.fuel.network/';

export const FAUCET_AMOUNTS: Record<string, number> = {
  UNI: 50,
  BTC: 1,
  USDC: 1000000,
  USDT: 1000000,
  BNB: 300,
};

export const FUEL_ETH_BASE_ASSET_ID =
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

export const SYMBOL_TO_ICON: Record<string, any> = {
  USDC: usdc,
  USDT: usdt,
  ETH: eth,
  BTC: btc,
  UNI: uni,
  BNB: sway,
  SWAY: sway,
  FUEL: fuel,
};

export const SYMBOL_TO_NAME: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDC: 'USD Coin',
  USDT: 'Tether',
  UNI: 'Uniswap',
  BNB: 'Binance Coin',
};
