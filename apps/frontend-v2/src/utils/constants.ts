import tokenLogos from './tokenLogos';
import tokens from './tokens.testnet.json';

export interface IToken {
  logo: string;
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Indexer URL
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL!;
export const NODE_URL = 'https://testnet.fuel.network/v1/graphql';
// Contract addresses
export interface IContractsConfig {
  priceOracle: string;
  market: string;
  tokenFactory: string;
}

export const CONTRACT_ADDRESSES: IContractsConfig = {
  priceOracle:
    '0x73591bf32f010ce4e83d86005c24e7833b397be38014ab670a73f6fde59ad607',
  market: '0xa31be85925a6031182aff87e9b41509050f17eeaea20311493e1e2753a6a1798',
  tokenFactory:
    '0x375745fb68ab9faf2f6754e4419148bd7d2c4a7b9be4eb2d1b25973da24bb995',
};

// Explorer URL
export const EXPLORER_URL = 'https://app.fuel.network/tx';

// Faucet configuration
export const FAUCET_URL = 'https://faucet-testnet.fuel.network/';
export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map(
  (t) =>
    ({
      ...t,
      logo: tokenLogos[t.symbol],
    }) as IToken
);
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc: Record<string, IToken>, t) => {
    acc[t.symbol] = t;
    return acc;
  },
  {}
);

export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc: Record<string, IToken>, t) => {
    acc[t.assetId] = t;
    return acc;
  },
  {}
);
export const FAUCET_AMOUNTS: Record<string, number> = {
  UNI: 50,
  BTC: 1,
  USDC: 300,
};

export const collaterals: IToken[] = [
  TOKENS_BY_SYMBOL.ETH,
  TOKENS_BY_SYMBOL.BTC,
  TOKENS_BY_SYMBOL.UNI,
];
