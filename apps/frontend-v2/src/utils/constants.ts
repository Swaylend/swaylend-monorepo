import fuel from '/public/icons/fuel-logo.svg?url';
import btc from '/public/tokens/bitcoin.svg?url';
import eth from '/public/tokens/ethereum.svg?url';
import sway from '/public/tokens/sway.svg?url';
import uni from '/public/tokens/uni.svg?url';
import usdc from '/public/tokens/usdc.svg?url';
import usdt from '/public/tokens/usdt.svg?url';

// Indexer URL
export const NODE_URL = 'https://testnet.fuel.network/v1/graphql';
export const SWAYLEND_API = process.env.NEXT_PUBLIC_SWAYLEND_API!;

// Contract addresses
export type MarketConfiguration = {
  oracleAddress: string;
  marketAddress: string;
  tokenFactoryAddress: string;
  graphqlUrl: string;
};

export enum DeployedMarket {
  USDC = 'USDC',
  USDT = 'USDT',
}

export const DEPLOYED_MARKETS: Record<DeployedMarket, MarketConfiguration> = {
  USDC: {
    oracleAddress:
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0x689bfaf54edfc433f62d06f3581998f9cb32ce864da5ff99f4be7bed3556529d',
    tokenFactoryAddress:
      '0x9a781a698dcf09c4b201527fcc8ecde4f0e3ddc1bf0cedb11c61cbe3bf1add0c',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0x0891579ef65509eeba9c66742931cc21218cdb93dd2239dfec794e9d57f87286',
    tokenFactoryAddress:
      '0x2025b351d8f27d0c6604527d2d8fd2efaf37433ca23360871142e630425e20b2',
    graphqlUrl: 'https://indexer.bigdevenergy.link/8ce655e/v1/graphql',
  },
};

// Explorer URL
export const EXPLORER_URL = 'https://app.fuel.network/tx';

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

export const ASSET_ID_TO_SYMBOL: Record<string, string> = {
  '0xed6b3b187ea656c16d455b35c33a1469f7ff6a439633293e8eb13ec03c3cf7e5': 'USDC',
  '0x090b5962feec1b76c71f53cd8eaac7eb2fa48453d382fa04c907f9ca8378c10e': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0xe1a1e23b305a27c429af33d22f470b0c9f7f7e45064b5ef79a5e8b587f30b2fe': 'BTC',
  '0xdc556f50f05d18f73bf9eb832a81c523037e230a3873279b563a0f05c6d5d3cb': 'UNI',
  '0xe64cd1941eea4de6fa5a1db355f6ccacc555867724e2398066ec671d9efa8e6e': 'BTC',
  '0xf10411c25a6838c3056f1767f6f07d76ab8c3bef9ff52ef121cb7e3c606e585a': 'BNB',
};

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
