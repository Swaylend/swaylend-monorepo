import {
  FuelWalletConnector,
  FueletWalletConnector,
  WalletConnectConnector,
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { loadState, saveState } from '@src/utils/localStorage';
import { RootStore, storesContext } from '@stores';
import { autorun } from 'mobx';
import type React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import 'rc-notification/assets/index.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-loading-skeleton/dist/skeleton.css';
import 'rc-dialog/assets/index.css';
import GlobalStyles from '@src/themes/GlobalStyles';
import { ToastContainer } from 'react-toastify';
import ThemeWrapper from './themes/ThemeProvider';
import 'react-toastify/dist/ReactToastify.css';
import { ReactComponent as CloseIcon } from '@src/assets/icons/close.svg';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchInterval: 10 * 1000,
      },
    },
  });

  const initState = loadState();

  const mobxStore = new RootStore(initState);
  autorun(
    () => {
      console.dir(mobxStore);
      saveState(mobxStore.serialize());
    },
    { delay: 1000 }
  );

  return (
    <storesContext.Provider value={mobxStore}>
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
          <ThemeWrapper>
            <Router>{children}</Router>
            <ToastContainer
              icon={<div />}
              position="bottom-right"
              autoClose={500000}
              closeButton={({ closeToast }) => (
                <CloseIcon onClick={(e) => closeToast(e as any)} />
              )}
              hideProgressBar
              newestOnTop={true}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <GlobalStyles />
          </ThemeWrapper>
        </FuelProvider>
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </storesContext.Provider>
  );
}
