import btc from '/public/tokens/bitcoin.svg?url';
import bnb from '/public/tokens/bnb.svg?url';
import eth from '/public/tokens/ethereum.svg?url';
import ezeth from '/public/tokens/ezeth.svg?url';
import fuel from '/public/tokens/fuel.svg?url';
import pzeth from '/public/tokens/pzeth.svg?url';
import sdai from '/public/tokens/sdai.svg?url';
import sway from '/public/tokens/sway.svg?url';
import uni from '/public/tokens/uni.svg?url';
import usdc from '/public/tokens/usdc.svg?url';
import usdt from '/public/tokens/usdt.svg?url';
import weeth from '/public/tokens/weeth.svg?url';
import wsteth from '/public/tokens/wsteth.svg?url';

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
  BTC: 1,
  USDC: 1_000_000,
  USDT: 100_000_000,
  BNB: 300,
  ezETH: 1,
  sDAI: 100_000,
  weETH: 1,
  wstETH: 1,
  // Testnet only
  UNI: 50,
  pzETH: 1,
  SolvBTC: 1,
  'SolvBTC.BBN': 1,
};

export const SYMBOL_TO_ICON: Record<string, any> = {
  USDC: usdc,
  USDT: usdt,
  ETH: eth,
  SWAY: sway,
  FUEL: fuel,
  BTC: btc,
  BNB: bnb,
  ezETH: ezeth,
  sDAI: sdai,
  weETH: weeth,
  wstETH: wsteth,
  // Testnet only
  UNI: uni,
  pzETH: pzeth,
  SolvBTC: '/tokens/solvbtc.png',
  'SolvBTC.BBN': '/tokens/solvbtcbbn.png',
};

export const SYMBOL_TO_NAME: Record<string, string> = {
  ETH: 'Ethereum',
  USDC: 'USDC',
  USDT: 'USDT',
  BTC: 'Bitcoin',
  BNB: 'BNB',
  ezETH: 'ezETH',
  sDAI: 'sDAI',
  weETH: 'weETH',
  wstETH: 'wstETH',
  FUEL: 'FUEL',
  // Testnet only
  UNI: 'Uniswap',
  pzETH: 'pzETH',
  SolvBTC: 'SolvBTC',
  'SolvBTC.BBN': 'SolvBTC.BBN',
};
