'use client';

import { appConfig } from '@/configs';
import { Market } from '@/contract-types/v1';
import { useProvider } from '@/hooks';
import { useMarketAddressBasedContractsStore } from '@/stores/market-address-based-contract-store';
import { useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { useEffect } from 'react';

export default function MarketContractStoreWatcher(): null {
  const { wallet } = useWallet();
  const updateContracts =
    useMarketAddressBasedContractsStore.use.updateContracts();
  const { provider } = useProvider();
  const walletOrProvider = wallet || provider;

  useEffect(() => {
    if (!walletOrProvider) return;

    Object.keys(appConfig.client.v1.markets).forEach((market) => {
      const pythContract = new PythContract(
        appConfig.client.v1.markets[market].oracleAddress,
        walletOrProvider
      );

      const marketContract = new Market(
        appConfig.client.v1.markets[market].marketAddress,
        walletOrProvider
      );

      updateContracts(market, pythContract, marketContract);
    });
  }, [walletOrProvider]);

  return null;
}
