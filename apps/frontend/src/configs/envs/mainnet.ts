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
      alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID ?? '',
      fuelOblApi: process.env.NEXT_PUBLIC_FUEL_OBL_API ?? '',
      announcementEnabled:
        process.env.NEXT_PUBLIC_ANNOUNCEMENT_ENABLED === 'true',
    },
    server: {
      sentioApi: process.env.SENTIO_API_URL ?? '',
      sentioApiKey: process.env.SENTIO_API_KEY ?? '',
      sentioProcessorVersion: process.env.SENTIO_PROCESSOR_VERSION ?? '',
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
      '0x1c86fdd9e0e7bc0d2ae1bf6817ef4834ffa7247655701ee1b031b52a24c523da',
    marketAddress:
      '0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae',
    tokenFactoryAddress: '',
    graphqlUrl: 'https://indexer.hyperindex.xyz/bfc2f60/v1/graphql',
  },
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
  '0x1186afea9affb88809c210e13e2330b5258c2cef04bb8fff5eff372b7bd3f40f':
    'SolvBTC',
  '0x7a4f087c957d30218223c2baaaa365355c9ca81b6ea49004cfb1590a5399216f':
    'SolvBTC.BBN',
};
