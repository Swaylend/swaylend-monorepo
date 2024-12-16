'use client';

import 'react-toastify/dist/ReactToastify.css';

import { appConfig } from '@/configs';
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
import { CHAIN_IDS, type FuelConnector, Provider } from 'fuels';
import { UAParser } from 'my-ua-parser';
import { type ReactNode } from 'react';
import { fallback } from 'viem';
import { http, createConfig as createConfigWagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

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
  const isMobile = ['mobile', 'tablet'].includes(
    new UAParser('user-agent').getDevice().type ?? ''
  );
  const provider = Provider.create(appConfig.client.fuelNodeUrl);
  const connectors: Array<FuelConnector> = [
    new FueletWalletConnector(),
    ...(!isMobile ? [new FuelWalletConnector(), new BakoSafeConnector()] : []),
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

export const FuelProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <FuelProvider
      theme="dark"
      uiConfig={UI_CONFIG}
      networks={NETWORKS}
      fuelConfig={FUEL_CONFIG}
    >
      {children}
    </FuelProvider>
  );
};
