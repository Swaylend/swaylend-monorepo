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

// export enum DeployedMarket {
//   USDC = 'USDC',
//   USDT = 'USDT',
// }

// export const DEPLOYED_MARKETS: Record<DeployedMarket, MarketConfiguration> = {
//   USDC: {
//     oracleAddress:
//       '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
//     marketAddress:
//       '0x8cd7937a7688b8856eb480cea41b9a04ef931cfd9fb7d1172e158be653b41577',
//     tokenFactoryAddress:
//       '0x6a1d626646995784eaad80b90732b9be884462d55241549b32c6161ea235978d',
//     graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
//   },
//   USDT: {
//     oracleAddress:
//       '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
//     marketAddress:
//       '0xf75a4aa3a36e2031cdbf6528b109b8daa414eb8b36960c34e32a0e970b89dcd6',
//     tokenFactoryAddress:
//       '0x44ca7a95b5e9e5eb6291b7bb26d078f059631535608eea2f0825f934b8365499',
//     graphqlUrl: 'https://indexer.bigdevenergy.link/8ce655e/v1/graphql',
//   },
// };

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

// export const ASSET_ID_TO_SYMBOL: Record<string, string> = {
//   '0x6bc6760474fd8473ec855cd53026b88929ce28336575cfda806ebfe284d2bb90': 'USDC',
//   '0xb81db75c68c9af091562123e06cb1f7270f3f62d3a13d3c665a0c5d2fac0e593': 'USDT',
//   '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
//   '0x82fba53ca24012613544c7698a23c9765760ce66413a8a04eec1577c77f53e8e': 'BTC',
//   '0x5222b5de2ae362219ed060428739f41b6f6897699ff591693365268d13d68a62': 'UNI',
//   '0x7e18820f90cf9f6ce6099a0ef6af99c21130fab8567d1eb7f8c75b07c64782fb': 'BTC',
//   '0x495f02ea80d6af96928f6ff355d891ab6b11f843c94d42fdd3f2a5768c4eff35': 'BNB',
// };

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
