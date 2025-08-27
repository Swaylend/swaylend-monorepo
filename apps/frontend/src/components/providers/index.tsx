'use client';

import 'react-toastify/dist/ReactToastify.css';

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { type ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import MarketContractStoreWatcher from '@/components/providers/market-contract-store-watcher';
import { FuelProviderWrapper } from './fuel-provider-wrapper';
import PostHogIdentify from './post-hog-identify';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 10 * 60 * 1000, // Run GC every 10 mins
        staleTime: 60 * 1000, // 1 minute default
        retry: process.env.NODE_ENV === 'development' ? 1 : 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchIntervalInBackground: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

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
      disableTransitionOnChange
      enableSystem={false}
      forcedTheme="dark"
    >
      <NuqsAdapter>
        <PostHogProvider client={posthog}>
          <QueryClientProvider client={queryClient}>
            <FuelProviderWrapper>
              {children}
              <MarketContractStoreWatcher />
              <PostHogIdentify />
              <ToastContainer
                autoClose={5000}
                closeOnClick={false}
                draggable
                hideProgressBar={false}
                icon={false}
                newestOnTop={true}
                pauseOnFocusLoss
                pauseOnHover
                position="bottom-right"
                progressStyle={{ background: 'hsl(var(--primary))' }}
                rtl={false}
                style={{ zIndex: 1000 }}
                theme="dark"
              />
            </FuelProviderWrapper>
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </QueryClientProvider>
        </PostHogProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
};
