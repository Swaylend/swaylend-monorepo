import tokenLogos from './tokenLogos';
import tokens from './tokens.testnet.json';

export const ROUTES = {
  ROOT: '/',
  FAUCET: '/faucet',
  TUTORIALS: '/tutorials',
  TUTORIAL: '/tutorials/:tutorialId',
  DASHBOARD: '/dashboard',
  WALLET: '/wallet',
  MARKET: '/market',
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

export const TX_GAS_LIMIT = 1000000;

export const INDEXER_URL =
  'https://spark-indexer.spark-defi.com/api/sql/composabilitylabs/spark_indexer';

export const NODE_URL = 'https://testnet.fuel.network/v1/graphql';

export const EXPLORER_URL = 'https://app.fuel.network';

export const FAUCET_URL = 'https://faucet-testnet.fuel.network/';
export const CONTRACT_ADDRESSES: IContractsConfig = {
  priceOracle:
    '0x73591bf32f010ce4e83d86005c24e7833b397be38014ab670a73f6fde59ad607',
  market: '0xa31be85925a6031182aff87e9b41509050f17eeaea20311493e1e2753a6a1798',
  tokenFactory:
    '0x375745fb68ab9faf2f6754e4419148bd7d2c4a7b9be4eb2d1b25973da24bb995',
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
