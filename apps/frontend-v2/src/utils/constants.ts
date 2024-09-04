export interface IToken {
  logo: string;
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  pythSymbol: string;
  priceFeed: string;
}

// Indexer URL
export const NODE_URL = 'https://testnet.fuel.network/v1/graphql';

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
      '0xc3c47cdeaec412778fc86842b44fb061b350db57f9d52def4f73036156f71506',
    marketAddress:
      '0x8cd0c973a8ab7c15c0a8ee8f5cb4dd04ea3f27411c8eef6e76f3765fe43863fe',
    tokenFactoryAddress:
      '0xf190b8420458f3fff1149343a60d9fe721a49c9caf7afb54d1bde9d72424bec6',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xc3c47cdeaec412778fc86842b44fb061b350db57f9d52def4f73036156f71506',
    marketAddress:
      '0x7c8fb9bb98269f51789c115c251e37a4dab4292e7795396a6a21250d4cec8aff',
    tokenFactoryAddress:
      '0xb43705648c279371c777d8bc9f8867688f8bb10896e20bd337c590dec5471b29',
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
  USDC: 300,
  USDT: 300,
  BNB: 300,
};

export const FUEL_ETH_BASE_ASSET_ID =
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

export const ASSET_ID_TO_SYMBOL: Record<string, string> = {
  '0xfe744f19db1affff30c628b29d93e330f966ecb649ba83606b1ff49ac9b37f47': 'USDC',
  '0x037ea5d51e94f792554fb14e117cfb5129650d162455febd9a74ab4f85f554e7': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0xe71f395845246fd16ddee5317fedaf169c602c13158488979326d5d5e7705719': 'BTC',
  '0xea49850b5a88ac6291de4be2c11699e65e6a61685da43bef156379ee2764ea94': 'UNI',
  '0x41d27014277db7dbcaf043472455df4bd66c6367dc9cb1d252ab35854d4d5a33': 'BTC',
  '0x18fdaa23cd9b5ad26d535b0c16cf522571cfd89fe3c60ec67d5e1555cf540aef': 'BNB',
};
