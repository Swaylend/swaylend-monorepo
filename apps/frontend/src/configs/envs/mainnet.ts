import { defineConfig } from '../define-config';
import type { DeployedMarketsV1, DeployedMarketsV2, Rewards } from '../types';

export function createMainnetConfig() {
  return defineConfig({
    env: 'mainnet',

    client: {
      shared: {
        swaylendApi: process.env.NEXT_PUBLIC_SWAYLEND_API ?? '',
        posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
        posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '',
        hermesApi: process.env.NEXT_PUBLIC_HERMES_API ?? '',
        walletConnectProjectId:
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
        fuelExplorerUrl: process.env.NEXT_PUBLIC_FUEL_EXPLORER_URL ?? '',
        fuelNodeUrl: process.env.NEXT_PUBLIC_FUEL_NODE_URL ?? '',
        alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID ?? '',
        baseAssetId:
          '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
        assets,
        useBurnerWallet: false,
        marketAddressToBaseAssetName,
        symbols,
      },
      v1: {
        announcementEnabled:
          process.env.NEXT_PUBLIC_V1_ANNOUNCEMENT_ENABLED === 'true',
        sentioApi: process.env.NEXT_PUBLIC_V1_SENTIO_API_URL ?? '',
        sentioApiKey: process.env.NEXT_PUBLIC_V1_SENTIO_API_KEY ?? '',
        sentioProcessorVersion:
          process.env.NEXT_PUBLIC_V1_SENTIO_PROCESSOR_VERSION ?? '',
        markets: markets_v1,
        rewards: rewards_v1,
      },
      v2: {
        announcementEnabled:
          process.env.NEXT_PUBLIC_V2_ANNOUNCEMENT_ENABLED === 'true',
        sentioApi: process.env.NEXT_PUBLIC_V2_SENTIO_API_URL ?? '',
        sentioApiKey: process.env.NEXT_PUBLIC_V2_SENTIO_API_KEY ?? '',
        sentioProcessorVersion:
          process.env.NEXT_PUBLIC_V2_SENTIO_PROCESSOR_VERSION ?? '',
        markets: markets_v2,
        rewards: rewards_v2,
      },
    },
  });
}

const markets_v1: DeployedMarketsV1 = {
  USDC: {
    oracleAddress:
      '0x1c86fdd9e0e7bc0d2ae1bf6817ef4834ffa7247655701ee1b031b52a24c523da',
    marketAddress:
      '0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae',
    tokenFactoryAddress: '',
    graphqlUrl: 'https://indexer.hyperindex.xyz/bfc2f60/v1/graphql',
  },
};

const markets_v2: DeployedMarketsV2 = {
  USDC: {
    pythAddress: '',
    redstoneAddress: '',
    storkAddress:
      '0x9c118ae13927dd51ba59c0370dc8c272a3b64ccd675950750c8840a649c81149',
    marketAddress: '',
    tokenFactoryAddress: '',
    graphqlUrl: '',
  },
};

const marketAddressToBaseAssetName: Record<string, string> = {
  '0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae': 'USDC',
};

const rewards_v1: Rewards = {
  USDC: [
    {
      poolSize: 2_000_000,
      assetId:
        '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-15T00:00:00Z',
      endDate: '2025-01-22T00:00:00Z',
      durationInDays: 7,
    },
    {
      poolSize: 2_600_000,
      assetId:
        '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-22T00:00:00Z',
      endDate: '2025-01-29T00:00:00Z',
      durationInDays: 7,
    },
    {
      poolSize: 2_800_000,
      assetId:
        '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
      supplyRewardPercentage: 0.5,
      borrowRewardPercentage: 0.5,
      startDate: '2025-01-29T00:00:00Z',
      endDate: '2025-02-05T00:00:00Z',
      durationInDays: 7,
    },
    {
      poolSize: 2_160_666,
      assetId:
        '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
      supplyRewardPercentage: 0.35,
      borrowRewardPercentage: 0.65,
      startDate: '2025-02-05T00:00:00Z',
      endDate: '2025-02-14T00:00:00Z',
      durationInDays: 9,
    },
    {
      poolSize: 2_160_666,
      assetId:
        '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
      supplyRewardPercentage: 0.35,
      borrowRewardPercentage: 0.65,
      startDate: '2025-02-14T00:00:00Z',
      endDate: '2025-02-21T00:00:00Z',
      durationInDays: 7,
    },
    {
      poolSize: 2_160_666,
      assetId:
        '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
      supplyRewardPercentage: 0.35,
      borrowRewardPercentage: 0.65,
      startDate: '2025-02-21T00:00:00Z',
      endDate: '2025-02-29T00:00:00Z',
      durationInDays: 8,
    },
  ],
};

const rewards_v2: Rewards = {
  USDC: [],
};

const assets: Record<string, string> = {
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b': 'USDC',
  '0xa0265fb5c32f6e8db3197af3c7eb05c48ae373605b8165b6f4a51c5b0ba4812e': 'USDT',
  '0x91b3559edb2619cde8ffb2aa7b3c3be97efd794ea46700db7092abeee62281b0': 'ezETH',
  '0x1493d4ec82124de8f9b625682de69dcccda79e882b89a55a8c737b12de67bd68': 'pzETH',
  '0x9e46f919fbf978f3cad7cd34cca982d5613af63ff8aab6c379e4faa179552958': 'sDAI',
  '0x239ed6e12b7ce4089ee245244e3bf906999a6429c2a9a445a1e1faf56914a4ab': 'weETH',
  '0x1a7815cc9f75db5c24a5b0814bfb706bb9fe485333e98254015de8f48f84c67b':
    'wstETH',
  '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82': 'FUEL',
  '0x1186afea9affb88809c210e13e2330b5258c2cef04bb8fff5eff372b7bd3f40f':
    'SolvBTC',
  '0x7a4f087c957d30218223c2baaaa365355c9ca81b6ea49004cfb1590a5399216f':
    'SolvBTC.BBN',
};

const symbols: Record<string, string> = {
  USDC: '0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b',
  USDT: '0xa0265fb5c32f6e8db3197af3c7eb05c48ae373605b8165b6f4a51c5b0ba4812e',
  ezETH: '0x91b3559edb2619cde8ffb2aa7b3c3be97efd794ea46700db7092abeee62281b0',
  pzETH: '0x1493d4ec82124de8f9b625682de69dcccda79e882b89a55a8c737b12de67bd68',
  sDAI: '0x9e46f919fbf978f3cad7cd34cca982d5613af63ff8aab6c379e4faa179552958',
  weETH: '0x239ed6e12b7ce4089ee245244e3bf906999a6429c2a9a445a1e1faf56914a4ab',
  wstETH: '0x1a7815cc9f75db5c24a5b0814bfb706bb9fe485333e98254015de8f48f84c67b',
  ETH: '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
  FUEL: '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82',
  SolvBTC: '0x1186afea9affb88809c210e13e2330b5258c2cef04bb8fff5eff372b7bd3f40f',
  'SolvBTC.BBN':
    '0x7a4f087c957d30218223c2baaaa365355c9ca81b6ea49004cfb1590a5399216f',
};
