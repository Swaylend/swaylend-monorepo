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
      '0x103465f1c0c901471b868b4a9e4e57c381168ac38ee5b59732943e9e004c488d',
    marketAddress:
      '0x6ad4681dfbc01a1019335f9d9cb3fa06e4ae7ed334ff20fb4576d6b471889c84',
    tokenFactoryAddress: '',
    graphqlUrl: '',
  },
};

const assets: Record<string, string> = {
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': 'ETH',
  '0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b': 'USDC',
};
