import type BigNumber from 'bignumber.js';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

export enum ACTION_TYPE {
  SUPPLY = 'SUPPLY',
  BORROW = 'BORROW',
  REPAY = 'REPAY',
  WITHDRAW = 'WITHDRAW',
}

export enum ACTION_MODE {
  DEPOSIT = 0,
  WITHDRAW = 1,
}

interface MarketStore {
  mode: ACTION_MODE;
  action: ACTION_TYPE | null;
  loading: boolean;
  tokenAmount: BigNumber | null;
  actionTokenAssetId: string | null;

  changeMode: (mode: ACTION_MODE) => void;
  changeAction: (action: ACTION_TYPE | null) => void;
  changeLoading: (loading: boolean) => void;
  changeTokenAmount: (tokenAmount: BigNumber | null) => void;
  changeActionTokenAssetId: (assetId: string | null) => void;
}

export const marketStoreInitialState = {
  mode: 0,
  action: null,
  loading: false,
  tokenAmount: null,
  actionTokenAssetId: null,
};

export const useMarketStore = createWithEqualityFn<MarketStore>()(
  (set) => ({
    ...marketStoreInitialState,

    changeMode: (mode: ACTION_MODE) => set({ mode }),
    changeAction: (action: ACTION_TYPE | null) => set({ action }),
    changeLoading: (loading: boolean) => set({ loading }),
    changeTokenAmount: (tokenAmount: BigNumber | null) => set({ tokenAmount }),
    changeActionTokenAssetId: (assetId: string | null) =>
      set({ actionTokenAssetId: assetId }),
  }),
  shallow
);
