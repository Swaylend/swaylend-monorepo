'use client';

import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import { useProvider } from '@/hooks';
import {
  selectUpdateContracts,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';
import { useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { FuelPricesContractConnector } from '@redstone-finance/fuel-connector';
import { Provider, Wallet } from 'fuels';
import { useEffect } from 'react';

export default function MarketContractStoreWatcher(): null {
  const { wallet } = useWallet();
  const updateContracts = useMarketAddressBasedContractsStore(
    selectUpdateContracts
  );
  const { provider } = useProvider();
  const walletOrProvider = wallet || provider;

  useEffect(() => {
    if (!walletOrProvider) return;

    Object.keys(appConfig.markets).forEach((market) => {
      const pythContract = new PythContract(
        appConfig.markets[market].pythOracleAddress,
        walletOrProvider
      );

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
        walletOrProvider
      );

      const redstoneContract = new FuelPricesContractConnector(
        walletOrProvider instanceof Provider
          ? Wallet.generate({
              provider: walletOrProvider,
            })
          : walletOrProvider,
        appConfig.markets[market].redstoneOracleAddress
      );

      updateContracts(market, pythContract, redstoneContract, marketContract);
    });
  }, [walletOrProvider]);

  return null;
}
