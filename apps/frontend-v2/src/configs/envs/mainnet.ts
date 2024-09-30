import { defineConfig } from '../defineConfig';
import type { DeployedMarkets } from '../types';

export function createMainnetConfig() {
  return defineConfig({
    env: 'mainnet',
    client: {
      swaylendApi: process.env.NEXT_PUBLIC_SWAYLEND_API ?? '',
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
      posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '',
      hermesApi: process.env.NEXT_PUBLIC_HERMES_API ?? '',
      walletConnectProjectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
      fuelExplorerUrl: process.env.NEXT_PUBLIC_FUEL_EXPLORER_URL ?? '',
      fuelNodeUrl: process.env.NEXT_PUBLIC_FUEL_NODE_URL ?? '',
      alchemyUrl: process.env.NEXT_PUBLIC_ALCHEMY_URL ?? '',
    },
    server: {
      sentioApi: process.env.SENTIO_API_URL ?? '',
      sentioApiKey: process.env.SENTIO_API_KEY ?? '',
    },
    baseAssetId:
      '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
    markets: markets,
    assets: assets,
    useBurnerWallet: false,
  });
}

const markets: DeployedMarkets = {
  USDC: {
    oracleAddress:
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0xd4a6a92bedda0c9ebd5c82805b7573795532411ebb1503f3adacb59714d7fd35',
    tokenFactoryAddress:
      '0x6a1d626646995784eaad80b90732b9be884462d55241549b32c6161ea235978d',
    graphqlUrl: 'https://indexer.bigdevenergy.link/c755070/v1/graphql',
  },
  USDT: {
    oracleAddress:
      '0xe31e04946c67fb41923f93d50ee7fc1c6c99d6e07c02860c6bea5f4a13919277',
    marketAddress:
      '0x0239b371a4f817933c65907b078ff77064427a50752683cba78d143349cdf598',
    tokenFactoryAddress:
      '0x44ca7a95b5e9e5eb6291b7bb26d078f059631535608eea2f0825f934b8365499',
    graphqlUrl: 'https://indexer.bigdevenergy.link/8ce655e/v1/graphql',
  },
};

const assets: Record<string, string> = {
  '0x6bc6760474fd8473ec855cd53026b88929ce28336575cfda806ebfe284d2bb90': 'USDC',
  '0xb81db75c68c9af091562123e06cb1f7270f3f62d3a13d3c665a0c5d2fac0e593': 'USDT',
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0x82fba53ca24012613544c7698a23c9765760ce66413a8a04eec1577c77f53e8e': 'BTC',
  '0x5222b5de2ae362219ed060428739f41b6f6897699ff591693365268d13d68a62': 'UNI',
  '0x7e18820f90cf9f6ce6099a0ef6af99c21130fab8567d1eb7f8c75b07c64782fb': 'BTC',
  '0x495f02ea80d6af96928f6ff355d891ab6b11f843c94d42fdd3f2a5768c4eff35': 'BNB',
};
