'use client';

import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { Market } from '@/contract-types';
import { create } from 'zustand';
import { useProviderStore } from '@/stores/providerStore';
import { useMarketStore } from '@/stores/marketStore';
import { appConfig } from '@/configs';

interface Store {
  pythContract: PythContract | undefined;
  marketContract: Market | undefined;
  updateContracts: (
    pythContract: PythContract | undefined,
    marketContract: Market | undefined
  ) => void;
}

export const marketStoreInitialState = {
  pythContract: undefined,
  marketContract: undefined,
};

export const useMarketAddressBasedContractsStore = create<Store>()((set) => ({
  ...marketStoreInitialState,
  updateContracts: (
    pythContract: PythContract | undefined,
    marketContract: Market | undefined
  ) => {
    if (!pythContract || !marketContract) return;
    set({ pythContract, marketContract });
  },
}));

export const selectPythContract = (state: Store) => state.pythContract;
export const selectMarketContract = (state: Store) => state.marketContract;
export const selectUpdateContracts = (state: Store) => state.updateContracts;

// Initialize with valid contracts as soon as possible.
// OBS: When contracts are initialized with provider instead of wallet they can only make read calls.
useProviderStore.subscribe((newState, _) => {
  const { updateContracts, pythContract, marketContract } =
    useMarketAddressBasedContractsStore.getState();
  const market = useMarketStore.getState().market;
  const initialized = marketContract || pythContract;

  if (newState.provider && !initialized && market) {
    console.log('fsk initializing');
    const pythContract = new PythContract(
      appConfig.markets[market].oracleAddress,
      newState.provider
    );
    const marketContract = new Market(
      appConfig.markets[market].marketAddress,
      newState.provider
    );
    updateContracts(pythContract, marketContract);
  } else {
    console.log('fsk not initializing');
  }
});
