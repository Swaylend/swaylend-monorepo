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
      '0x891734bb325148ed28fdc7603e404375c44ee090b66708f45c722ccd702517d5',
    tokenFactoryAddress:
      '0x3ec32d1dc979cc9862e779a573ceea9e4ddea0ab5bcbeac6f13aef0489821be2',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xc3c47cdeaec412778fc86842b44fb061b350db57f9d52def4f73036156f71506',
    marketAddress:
      '0x79d9be371612a8e367db167549797bf4228081cb2147cfe1bab0d369f401c821',
    tokenFactoryAddress:
      '0x8dba87c49afd9250c8641d4b113ce0ebefc9dc0bf9850124bb36916c55a20e83',
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
  '0xa91cc878ea68463efd1e1dab8e9709f8bdf704ae09890f67641ea417b0426627': 'USDC',
  '0xb721728f80e4e450f9078dc6df78f121593375531e8f8712b6e0f9c7a69b1985': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0xb976a09362dd94bdd03d1f924be913e010b438ef73e4b565a500848d327baf54': 'BTC',
  '0x6104c8e55327b418ac489353c977a7344d4ed3ff74af61a9efe9d3fe0f81c211': 'UNI',
  '0x2eef3d6048f6a6cf7a9d48b9724cf8035f6d25c0b25048173b47982464fe9a8d': 'BTC',
  '0x093b81d58871e5fb0dd382fb4696f7c074ccab19800298cd52e1111f5db859a7': 'BNB',
};
