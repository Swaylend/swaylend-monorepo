'use client';

import type { PythContract } from '@pythnetwork/pyth-fuel-js';
import { create } from 'zustand';
import { appConfig } from '@/configs';
import type { Stork } from '@/contract-types/stork';
import type { Market, RedstonePrices } from '@/contract-types/v2';
import { createSelectors } from '../create-selectors';

type Store = {
  contracts: Map<
    string,
    {
      pythContract: PythContract | undefined;
      marketContract: Market | undefined;
      redstoneContract: RedstonePrices | undefined;
      storkContract: Stork | undefined;
    }
  >;
  updateContracts: (
    market: string,
    pythContract: PythContract | undefined,
    marketContract: Market | undefined,
    redstoneContract: RedstonePrices | undefined,
    storkContract: Stork | undefined
  ) => void;
};

export const marketStoreInitialState = {
  contracts: new Map(
    Object.keys(appConfig.client.v2.markets).map((market) => [
      market,
      {
        pythContract: undefined,
        marketContract: undefined,
        redstoneContract: undefined,
        storkContract: undefined,
      },
    ])
  ),
};

const useMarketAddressBasedContractsStoreBase = create<Store>()((set) => ({
  ...marketStoreInitialState,
  updateContracts: (
    market: string,
    pythContract: PythContract | undefined,
    marketContract: Market | undefined,
    redstoneContract: RedstonePrices | undefined,
    storkContract: Stork | undefined
  ) => {
    if (!(pythContract && marketContract)) return;

    set((store) => ({
      contracts: new Map(store.contracts).set(market, {
        pythContract,
        marketContract,
        redstoneContract,
        storkContract,
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
export const selectRedstoneContract = (state: Store, market: string) =>
  state.contracts.get(market)?.redstoneContract;
export const selectStorkContract = (state: Store, market: string) =>
  state.contracts.get(market)?.storkContract;
