'use client';

import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import { useProviderStore } from '@/stores/providerStore';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { create } from 'zustand';

interface Store {
  contracts: Map<
    string,
    {
      pythContract: PythContract | undefined;
      marketContract: Market | undefined;
    }
  >;
  updateContracts: (
    market: string,
    pythContract: PythContract | undefined,
    marketContract: Market | undefined
  ) => void;
}

export const marketStoreInitialState = {
  contracts: new Map(
    Object.keys(appConfig.markets).map((market) => [
      market,
      {
        pythContract: undefined,
        marketContract: undefined,
      },
    ])
  ),
};

export const useMarketAddressBasedContractsStore = create<Store>()((set) => ({
  ...marketStoreInitialState,
  updateContracts: (
    market: string,
    pythContract: PythContract | undefined,
    marketContract: Market | undefined
  ) => {
    if (!pythContract || !marketContract) return;

    set((store) => ({
      contracts: new Map(store.contracts).set(market, {
        pythContract,
        marketContract,
      }),
    }));
  },
}));

export const selectPythContract = (state: Store, market: string) =>
  state.contracts.get(market)?.pythContract;
export const selectMarketContract = (state: Store, market: string) =>
  state.contracts.get(market)?.marketContract;
export const selectUpdateContracts = (state: Store) => state.updateContracts;

// Initialize with valid contracts as soon as possible.
// OBS: When contracts are initialized with provider instead of wallet they can only make read calls.
useProviderStore.subscribe((newState, _) => {
  if (!newState.provider) return;

  const { updateContracts, contracts } =
    useMarketAddressBasedContractsStore.getState();

  console.log('initialize contracts');

  Object.keys(appConfig.markets).forEach((market) => {
    if (contracts.get(market) || !newState.provider) return;
    const pythContract = new PythContract(
      appConfig.markets[market].oracleAddress,
      newState.provider
    );
    const marketContract = new Market(
      appConfig.markets[market].marketAddress,
      newState.provider
    );

    updateContracts(market, pythContract, marketContract);
  });
});
