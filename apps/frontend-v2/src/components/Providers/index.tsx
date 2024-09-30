'use client';

import 'react-toastify/dist/ReactToastify.css';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { type ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

import { appConfig } from '@/configs';
import { CHAIN_IDS } from 'fuels';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { fallback } from 'viem';
import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
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
  name: 'SwayLend',
  description: 'SwayLend',
  url: 'https://app.swaylend.com',
  icons: ['https://app.swaylend.com/logo512.png'],
};

const wagmiConfig = createConfig({
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
            networks={[
              {
                chainId: CHAIN_IDS.fuel.testnet,
              },
            ]}
            fuelConfig={{
              connectors: defaultConnectors({
                devMode: appConfig.env === 'testnet',
                wcProjectId: appConfig.client.walletConnectProjectId,
                ethWagmiConfig: wagmiConfig,
                chainId: CHAIN_IDS.fuel.testnet,
              }),
            }}
          >
            <>
              {children}
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
