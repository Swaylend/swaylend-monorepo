'use client';

import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import {
  selectUpdateContracts,
  useMarketAddressBasedContractsStore,
} from '@/stores/marketAddressBasedContractsStore';
import { useProvider, useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { useEffect, useMemo } from 'react';

export default function MarketContractStoreWatcher(): null {
  const { wallet } = useWallet();
  const { market } = useMarketStore();
  const updateContracts = useMarketAddressBasedContractsStore(
    selectUpdateContracts
  );
  const { provider } = useProvider();
  const walletOrProvider = wallet || provider;

  const pythContract = useMemo(() => {
    if (!walletOrProvider || !market) return;
    return new PythContract(
      appConfig.markets[market].oracleAddress,
      walletOrProvider
    );
  }, [walletOrProvider, market]);

  const marketContract = useMemo(
    () =>
      walletOrProvider && market
        ? new Market(appConfig.markets[market].marketAddress, walletOrProvider)
        : undefined,
    [walletOrProvider, market]
  );

  useEffect(() => {
    updateContracts(pythContract, marketContract);
  }, [pythContract, marketContract, updateContracts]);

  return null;
}
