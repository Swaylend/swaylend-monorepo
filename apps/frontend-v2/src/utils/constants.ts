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
    '0xc3c47cdeaec412778fc86842b44fb061b350db57f9d52def4f73036156f71506',
  market: '0x40306bb23caad2dceb3907d62f50d75a0d8cd5e7a01b2f3e4189d3a54be42e40',
  tokenFactory:
    '0xcbfa9f158e1ef6ba2f7c6696a47dea7f42e9c229f96dd9184a318f9bb5610665',
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
    acc[t.symbol] = { ...t, priceFeed: `0x${t.priceFeed}` };
    return acc;
  },
  {}
);

export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc: Record<string, IToken>, t) => {
    acc[t.assetId] = { ...t, priceFeed: `0x${t.priceFeed}` };
    return acc;
  },
  {}
);

export const TOKENS_BY_PRICE_FEED: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc: Record<string, IToken>, t) => {
    acc[t.priceFeed] = { ...t, priceFeed: `0x${t.priceFeed}` };
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
