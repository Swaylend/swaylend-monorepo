import tokenLogos from './tokenLogos';
import tokens from './tokens.testnet.json';

export const ROUTES = {
  ROOT: '/',
  FAUCET: '/faucet',
  TUTORIALS: '/tutorials',
  TUTORIAL: '/tutorials/:tutorialId',
  DASHBOARD: '/dashboard',
  WALLET: '/wallet',
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map(
  (t) =>
    ({
      ...t,
      logo: tokenLogos[t.symbol],
    }) as IToken
);
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);
export const INDEXER_URL =
  'https://spark-indexer.spark-defi.com/api/sql/composabilitylabs/spark_indexer';

export const NODE_URL = 'https://testnet.fuel.network/v1/graphql';

export const EXPLORER_URL = 'https://app.fuel.network';

export const FAUCET_URL = 'https://faucet-testnet.fuel.network/';
export const CONTRACT_ADDRESSES: IContractsConfig = {
  priceOracle:
    '0x1f6a416e814dd5adf97b994f1eb5b6d694f91bfafdc75686f1f7ed64b760332c',
  market: '0x91240c4837da1d27b4fc4d3f498fd4b92b1e782ace1c6e22622a27ae635c3a76',
  tokenFactory:
    '0x4069ff37aa31cc75849c78c6e92a92d01499c22e2ae922cfa9c311a845c7de63',
};

export interface IToken {
  logo: string;
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface IContractsConfig {
  priceOracle: string;
  market: string;
  tokenFactory: string;
}
