'use client';

import { FuelProvider } from '@fuels/react';
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CloseIcon from '@/assets/icons/close.svg';
import {
  FuelWalletConnector,
  FueletWalletConnector,
  WalletConnectConnector,
} from '@fuels/connectors';
import Image from 'next/image';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 15 * 1000,
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

export const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <FuelProvider
          theme="dark"
          fuelConfig={{
            connectors: [
              new FuelWalletConnector(),
              new FueletWalletConnector(),
              new WalletConnectConnector({
                // TODO: setup walletconnect project and add project id
                projectId: '972bec1eae519664815444d4b7a7578a',
              }),
            ],
          }}
        >
          <div>
            {children}
            <ToastContainer
              icon={<div />}
              position="bottom-right"
              autoClose={5000}
              closeButton={({ closeToast }) => (
                // <CloseIcon onClick={(e: any) => closeToast(e)} />
                <Image
                  src={CloseIcon}
                  alt="close"
                  width={24}
                  height={24}
                  onClick={(e) => closeToast(e as any)}
                />
              )}
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
          </div>
        </FuelProvider>
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
