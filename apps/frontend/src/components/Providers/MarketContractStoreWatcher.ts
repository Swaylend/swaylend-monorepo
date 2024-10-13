'use client';

import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import {
  selectUpdateContracts,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';
import { useProvider, useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
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

    console.log('Update contracts to use:');
    console.log('Wallet:', wallet?.address.toB256());
    console.log('Provider:', provider?.url);

    Object.keys(appConfig.markets).forEach((market) => {
      const pythContract = new PythContract(
        appConfig.markets[market].oracleAddress,
        walletOrProvider
      );

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
        walletOrProvider
      );

      updateContracts(market, pythContract, marketContract);
    });
  }, [walletOrProvider]);

  return null;
}
