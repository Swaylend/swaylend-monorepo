import tokenLogos from './tokenLogos';
import tokens from './tokens.testnet.json';

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
      '0x40306bb23caad2dceb3907d62f50d75a0d8cd5e7a01b2f3e4189d3a54be42e40',
    tokenFactoryAddress:
      '0xcbfa9f158e1ef6ba2f7c6696a47dea7f42e9c229f96dd9184a318f9bb5610665',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xc3c47cdeaec412778fc86842b44fb061b350db57f9d52def4f73036156f71506',
    marketAddress:
      '0x38c3c36bbb5f95256539cb5a315720815eb9623cf2de2561f5594d2699aa0b22',
    tokenFactoryAddress:
      '0xb0bad135fde037b08223aa4216f401d33f5fdd9e495fcaae3b4ea60b629c2fd0',
    graphqlUrl: 'https://indexer.bigdevenergy.link/274bd87/v1/graphql',
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
  '0x02f373b67576faf604dceb27675e88a3eb414f4bef5dea6cd3b143eeadd9401a': 'USDC',
  '0x17341c3312f4e7e6a6b2fd907b3396733c97f57fb531c841cbf3c1eac2b7ad40': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0x2df61e167accc18479e13d9564261b22d1bf1be5f200cd80139138c83c10e9bc': 'BTC',
  '0xb5efb423f3a4a10fed5e349d0096c4cd75ffb97c6a3e21bb59a685092698b0cf': 'UNI',
  '0x1479f7a4805cce7b79676b5668b21e32f68a1354e79669d94a600d03c55c5c4e': 'BTC',
  '0x750a24d292eb779670df1536b14e0b4fcc4ea4aef390d6858de65b1b919c0e54': 'BNB',
};
