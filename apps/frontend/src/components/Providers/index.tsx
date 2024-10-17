'use client';

import 'react-toastify/dist/ReactToastify.css';

import {
  BakoSafeConnector,
  BurnerWalletConnector,
  FuelWalletConnector,
  FuelWalletDevelopmentConnector,
  FueletWalletConnector,
  SolanaConnector,
  WalletConnectConnector,
  createConfig,
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { type ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

import MarketContractStoreWatcher from '@/components/Providers/MarketContractStoreWatcher';
import { appConfig } from '@/configs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CHAIN_IDS, type FuelConnector, Provider } from 'fuels';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { fallback } from 'viem';
import { http, createConfig as createConfigWagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import PostHogIdentify from './PostHogIdentify';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        gcTime: 5 * 60 * 1000, // Run GC every 5 mins
        staleTime: 1 * 60 * 1000, // Cache for 1 mins
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

const METADATA = {
  name: 'Swaylend',
  description: 'Swaylend',
  url: 'https://app.swaylend.com',
  icons: ['https://app.swaylend.com/logo512.png'],
};

const UI_CONFIG = {
  suggestBridge: false,
};
const NETWORKS = [
  appConfig.env === 'testnet'
    ? {
        bridgeURL: `${appConfig.client.fuelExplorerUrl}/bridge`,
        url: appConfig.client.fuelNodeUrl,
        chainId: CHAIN_IDS.fuel.testnet,
      }
    : {
        bridgeURL: `${appConfig.client.fuelExplorerUrl}/bridge`,
        url: appConfig.client.fuelNodeUrl,
        chainId: CHAIN_IDS.fuel.mainnet,
      },
];

const wagmiConfig = createConfigWagmiConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: appConfig.client.walletConnectProjectId,
      metadata: METADATA,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: METADATA.name,
      appLogoUrl: METADATA.icons[0],
      darkMode: true,
      reloadOnDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: fallback([
      http(
        `https://eth-mainnet.g.alchemy.com/v2/${appConfig.client.alchemyId}`
      ),
    ]),
    [sepolia.id]: fallback([
      http(
        `https://eth-sepolia.g.alchemy.com/v2/${appConfig.client.alchemyId}`
      ),
    ]),
  },
});

const customDefaultConnectors = (): Array<FuelConnector> => {
  const provider = Provider.create(appConfig.client.fuelNodeUrl);
  const connectors: Array<FuelConnector> = [
    new FueletWalletConnector(),
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new WalletConnectConnector({
      projectId: appConfig.client.walletConnectProjectId,
      wagmiConfig: wagmiConfig,
      chainId:
        appConfig.env === 'testnet'
          ? CHAIN_IDS.fuel.testnet
          : CHAIN_IDS.fuel.mainnet,
      fuelProvider: provider,
    }),
    new SolanaConnector({
      projectId: appConfig.client.walletConnectProjectId,
      chainId:
        appConfig.env === 'testnet'
          ? CHAIN_IDS.fuel.testnet
          : CHAIN_IDS.fuel.mainnet,
      fuelProvider: provider,
    }),
  ];

  if (appConfig.env === 'testnet') {
    connectors.push(
      new FuelWalletDevelopmentConnector(),
      new BurnerWalletConnector({
        chainId: CHAIN_IDS.fuel.testnet,
        fuelProvider: provider,
      })
    );
  }

  return connectors;
};

const FUEL_CONFIG = createConfig(() => ({
  connectors: customDefaultConnectors(),
}));

export const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      person_profiles: 'always',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: false,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug(); // debug mode in development
      },
    });
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <PostHogProvider client={posthog}>
        <QueryClientProvider client={queryClient}>
          <FuelProvider
            theme="dark"
            uiConfig={UI_CONFIG}
            networks={NETWORKS}
            fuelConfig={FUEL_CONFIG}
          >
            <>
              {children}
              <MarketContractStoreWatcher />
              <PostHogIdentify />
              <ToastContainer
                icon={false}
                position="bottom-right"
                style={{ zIndex: 1000 }}
                autoClose={5000}
                progressStyle={{ background: 'hsl(var(--primary))' }}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </>
          </FuelProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
};
