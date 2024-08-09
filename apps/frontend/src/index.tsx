import './index.css';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import { FuelProvider } from '@fuels/react';
import {
  WalletConnectConnector,
  FueletWalletConnector,
  FuelWalletConnector,
} from '@fuels/connectors';
import 'normalize.css';
import { loadState, saveState } from '@src/utils/localStorage';
import { RootStore, storesContext } from '@stores';
import { autorun } from 'mobx';
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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <storesContext.Provider value={mobxStore}>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        ui={false}
        fuelConfig={{
          connectors: [
            new FuelWalletConnector(),
            new FueletWalletConnector(),
            new WalletConnectConnector({
              // TODO: change wallet connect project id, and add it to env
              projectId: '',
            }),
          ],
        }}
      >
        <ThemeWrapper>
          <Router>
            <App />
          </Router>
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
  // </React.StrictMode>
);
