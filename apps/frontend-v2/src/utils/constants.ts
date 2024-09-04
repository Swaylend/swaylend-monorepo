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
      '0x5cd28d44008ab5f81b6a8bb684ac698c4e350bf99855004769b73097587185ed',
    tokenFactoryAddress:
      '0xc42945559a1d489c02849be67f601d8723f11881a167645ea64417b0306f68e3',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xc3c47cdeaec412778fc86842b44fb061b350db57f9d52def4f73036156f71506',
    marketAddress:
      '0xa6ea42b91f28e4937457dd2b74285b81343d517196d0a86e5e91d7247cffe4e0',
    tokenFactoryAddress:
      '0xf25ccea490d84d013dc660b0cd7b7ea4d8cf525c83df79cddc78264c0f5295cb',
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
  '0x2d52ecf6fa0a222ff796a748b61ef4e3ef844c2078afe4df6399e264a4f993ad': 'USDC',
  '0x04f9a75b617ff67856b05d96b00d070c2041db5c6563bb7e9ad09f6e12a2d57a': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0xfb5a7c0184ed850bbbdfc73c09b0885603bc81048f2481f3032b6c1398290021': 'BTC',
  '0x170ae7a2535154a5981db6cd0084689495849ad80a0b0dccdd7c579c9cfb7572': 'UNI',
  '0x84ebfaf29d43e88f74a1573830c27d06e69112f0f0cb0694a10e3cf94b011cfd': 'BTC',
  '0xaf0fb56ec3dbc594ea514e36042abdea14630be1569792ef73f09c09beac77cb': 'BNB',
};
