'use client';

import type { PythContract } from '@pythnetwork/pyth-fuel-js';
import { create } from 'zustand';
import { appConfig } from '@/configs';
import type { Market } from '@/contract-types/v1';
import { createSelectors } from '../create-selectors';

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
    Object.keys(appConfig.client.v1.markets).map((market) => [
      market,
      {
        pythContract: undefined,
        marketContract: undefined,
      },
    ])
  ),
};

const useMarketAddressBasedContractsStoreBase = create<Store>()((set) => ({
  ...marketStoreInitialState,
  updateContracts: (
    market: string,
    pythContract: PythContract | undefined,
    marketContract: Market | undefined
  ) => {
    if (!(pythContract && marketContract)) return;

    set((store) => ({
      contracts: new Map(store.contracts).set(market, {
        pythContract,
        marketContract,
      }),
    }));
  },
}));

export const useMarketAddressBasedContractsStore = createSelectors(
  useMarketAddressBasedContractsStoreBase
);

export const selectPythContract = (state: Store, market: string) =>
  state.contracts.get(market)?.pythContract;
export const selectMarketContract = (state: Store, market: string) =>
  state.contracts.get(market)?.marketContract;
