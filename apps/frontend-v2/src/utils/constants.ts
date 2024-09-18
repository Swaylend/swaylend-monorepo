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
      '0x9acd98624f163187a3dd558cb8e215d417f6c0ac291b78ba20f6df3c07a352e0',
    tokenFactoryAddress:
      '0xf93318805b83a8b43c8f8ac822cbfef6a9190f80dd0101b3c81fece13226b3c5',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0x5a22498724036fa16887731686c756aacf26e422ba64c826c5e521f47751f12b',
    tokenFactoryAddress:
      '0x31fa2d4e478308180a380fcafd786d2708b70a723e7742f8633956b03f3999ea',
    graphqlUrl: 'https://indexer.bigdevenergy.link/d1b799e/v1/graphql',
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
  '0x36a5d3c64c0a26af42a0d3e6cfbfd81e543036433a67770dbfbe57579b30b7a2': 'USDC',
  '0x54ed68ad09d522fad75d150751b9c40401ce39bb8ca2d8ee7c7fde493fc2499a': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0xca877514280b1b529097507a75e6c985e42ed3ae3ba381938990942043fbd3c8': 'BTC',
  '0x9f1bfac996a5e9bc12505e1d68b0298714c6576deafdd3c79c7e9694de1b18e8': 'UNI',
  '0xc6f12a7f0a4810c7b45462af602c8f896351396d2a54eeab9562168bcc94c47f': 'BTC',
  '0x2790257d173eafe4053f8c9760b27aed28c1f74498c7b3ec79c34fbc0f41167e': 'BNB',
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
