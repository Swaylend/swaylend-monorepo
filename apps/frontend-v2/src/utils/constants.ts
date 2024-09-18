import fuel from '/public/icons/fuel-logo.svg?url';
import btc from '/public/tokens/bitcoin.svg?url';
import eth from '/public/tokens/ethereum.svg?url';
import sway from '/public/tokens/sway.svg?url';
import uni from '/public/tokens/uni.svg?url';
import usdc from '/public/tokens/usdc.svg?url';
import usdt from '/public/tokens/usdt.svg?url';

// Indexer URL
export const NODE_URL = 'https://testnet.fuel.network/v1/graphql';
export const SWAYLEND_API = process.env.NEXT_PUBLIC_SWAYLEND_API!;

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
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0x9acd98624f163187a3dd558cb8e215d417f6c0ac291b78ba20f6df3c07a352e0',
    tokenFactoryAddress:
      '0xf93318805b83a8b43c8f8ac822cbfef6a9190f80dd0101b3c81fece13226b3c5',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0x5569d82de2c854151bf7e7196ffecfd495be8a6c9e77fdfc87d4fce2bb964270',
    tokenFactoryAddress:
      '0xc849843df1773f234d682cb23333093004c5f6430f723675213bfcb8c2df3f78',
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
  USDC: 1000000,
  USDT: 1000000,
  BNB: 300,
};

export const FUEL_ETH_BASE_ASSET_ID =
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

export const ASSET_ID_TO_SYMBOL: Record<string, string> = {
  '0x36a5d3c64c0a26af42a0d3e6cfbfd81e543036433a67770dbfbe57579b30b7a2': 'USDC',
  '0x4512f135579b7937cbf8646ec52b6348f4f767583f7797e9c9acbe86ceca7841': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0xca877514280b1b529097507a75e6c985e42ed3ae3ba381938990942043fbd3c8': 'BTC',
  '0x9f1bfac996a5e9bc12505e1d68b0298714c6576deafdd3c79c7e9694de1b18e8': 'UNI',
  '0xaf9fc9e6622ac78227ebd9f61fa3804123a2a85fdc6807946b9c65f4de4f9e06': 'BTC',
  '0xbed5c401f71b799a9d5327df0e83fc518a44058eeabfdb146b3543e8cfaaa8d8': 'BNB',
};

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
