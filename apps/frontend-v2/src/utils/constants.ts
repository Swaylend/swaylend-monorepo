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
      '0xc697c3c7ae51f67e9cd87046e5c26f08bc01533bcd46ca9663537d914bfe6317',
    tokenFactoryAddress:
      '0x469751fe5370326e33d8873ac5a9a883815c75fa75477538551f2067ec5f97f2',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c772021/v1/graphql',
  },
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

export const FUEL_ETH_BASE_ASSET_ID =
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';
