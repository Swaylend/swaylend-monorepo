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
    },
    server: {
      sentioApi: process.env.SENTIO_API_URL ?? '',
      sentioApiKey: process.env.SENTIO_API_KEY ?? '',
    },
    baseAssetId: 'TODO',
    markets: markets,
    assets: assets,
  });
}

const markets: DeployedMarkets = {};

const assets: Record<string, string> = {};
