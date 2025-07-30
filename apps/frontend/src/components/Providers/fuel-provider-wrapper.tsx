'use client';

import 'react-toastify/dist/ReactToastify.css';

import {
  BakoSafeConnector,
  BurnerWalletConnector,
  createConfig,
  FueletWalletConnector,
  FuelWalletConnector,
  FuelWalletDevelopmentConnector,
  SolanaConnector,
  WalletConnectConnector,
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { CHAIN_IDS, type FuelConnector, Provider } from 'fuels';
import type { ReactNode } from 'react';
import { fallback } from 'viem';
import { createConfig as createConfigWagmiConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { appConfig } from '@/configs';
import { isMobile } from '@/utils/is-mobile';

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
        bridgeURL: `${appConfig.client.shared.fuelExplorerUrl}/bridge`,
        url: appConfig.client.shared.fuelNodeUrl,
        chainId: CHAIN_IDS.fuel.testnet,
      }
    : {
        bridgeURL: `${appConfig.client.shared.fuelExplorerUrl}/bridge`,
        url: appConfig.client.shared.fuelNodeUrl,
        chainId: CHAIN_IDS.fuel.mainnet,
      },
];

const wagmiConfig = createConfigWagmiConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: appConfig.client.shared.walletConnectProjectId,
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
        `https://eth-mainnet.g.alchemy.com/v2/${appConfig.client.shared.alchemyId}`
      ),
    ]),
    [sepolia.id]: fallback([
      http(
        `https://eth-sepolia.g.alchemy.com/v2/${appConfig.client.shared.alchemyId}`
      ),
    ]),
  },
});

const customDefaultConnectors = (): FuelConnector[] => {
  const provider = new Provider(appConfig.client.shared.fuelNodeUrl);
  const connectors: FuelConnector[] = [
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: appConfig.client.shared.walletConnectProjectId,
      wagmiConfig,
      chainId:
        appConfig.env === 'testnet'
          ? CHAIN_IDS.fuel.testnet
          : CHAIN_IDS.fuel.mainnet,
      fuelProvider: provider,
    }),
    // new SolanaConnector({
    //   projectId: appConfig.client.shared.walletConnectProjectId,
    //   chainId:
    //     appConfig.env === 'testnet'
    //       ? CHAIN_IDS.fuel.testnet
    //       : CHAIN_IDS.fuel.mainnet,
    //   fuelProvider: provider,
    // }),
    // Add desktop only connectors
    // ...(isMobile(navigator.userAgent)
    //   ? []
    //   : [new FuelWalletConnector(), new BakoSafeConnector()]),
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
      fuelConfig={FUEL_CONFIG}
      networks={NETWORKS}
      theme="dark"
      uiConfig={UI_CONFIG}
    >
      {children}
    </FuelProvider>
  );
};
