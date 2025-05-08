'use client';

import { appConfig } from '@/configs';
import type { Market } from '@/contract-types';
import type { PythContract } from '@pythnetwork/pyth-fuel-js';
import type { FuelPricesContractConnector } from '@redstone-finance/fuel-connector';
import { create } from 'zustand';

interface Store {
  contracts: Map<
    string,
    {
      pythContract: PythContract | undefined;
      redstoneContract: FuelPricesContractConnector | undefined;
      marketContract: Market | undefined;
    }
  >;
  updateContracts: (
    market: string,
    pythContract: PythContract | undefined,
    redstoneContract: FuelPricesContractConnector | undefined,
    marketContract: Market | undefined
  ) => void;
}

export const marketStoreInitialState = {
  contracts: new Map(
    Object.keys(appConfig.markets).map((market) => [
      market,
      {
        pythContract: undefined,
        redstoneContract: undefined,
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
    redstoneContract: FuelPricesContractConnector | undefined,
    marketContract: Market | undefined
  ) => {
    if (!pythContract || !marketContract) return;

    set((store) => ({
      contracts: new Map(store.contracts).set(market, {
        pythContract,
        redstoneContract,
        marketContract,
      }),
    }));
  },
}));

export const selectPythContract = (state: Store, market: string) =>
  state.contracts.get(market)?.pythContract;
export const selectRedstoneContract = (state: Store, market: string) =>
  state.contracts.get(market)?.redstoneContract;
export const selectMarketContract = (state: Store, market: string) =>
  state.contracts.get(market)?.marketContract;
export const selectUpdateContracts = (state: Store) => state.updateContracts;
