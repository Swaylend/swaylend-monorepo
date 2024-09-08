import { DeployedMarket } from '@/utils';
import BigNumber from 'bignumber.js';
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

export enum MARKET_MODE {
  LEND = 'lend',
  BORROW = 'borrow',
}

interface MarketStore {
  market: DeployedMarket;

  mode: ACTION_MODE;
  marketMode: MARKET_MODE;
  action: ACTION_TYPE | null | undefined;
  tokenAmount: BigNumber;
  actionTokenAssetId: string | null | undefined;
  inputDialogOpen: boolean;

  changeMarket: (market: DeployedMarket) => void;
  changeMode: (mode: ACTION_MODE) => void;
  changeMarketMode: (mode: MARKET_MODE) => void;
  changeAction: (action: ACTION_TYPE | null | undefined) => void;
  changeTokenAmount: (tokenAmount: BigNumber) => void;
  changeActionTokenAssetId: (assetId: string | null | undefined) => void;
  changeInputDialogOpen: (open: boolean) => void;
}

export const marketStoreInitialState = {
  market: DeployedMarket.USDC,
  mode: 0,
  marketMode: MARKET_MODE.LEND,
  action: null,
  tokenAmount: new BigNumber(0),
  actionTokenAssetId: null,
  inputDialogOpen: false,
};

export const useMarketStore = createWithEqualityFn<MarketStore>()(
  (set) => ({
    ...marketStoreInitialState,

    changeMarket: (market: DeployedMarket) => set({ market }),
    changeInputDialogOpen: (open: boolean) => set({ inputDialogOpen: open }),
    changeMode: (mode: ACTION_MODE) => set({ mode }),
    changeMarketMode: (mode: MARKET_MODE) => set({ marketMode: mode }),
    changeAction: (action: ACTION_TYPE | null | undefined) => set({ action }),
    changeTokenAmount: (tokenAmount: BigNumber) => set({ tokenAmount }),
    changeActionTokenAssetId: (assetId: string | null | undefined) =>
      set({ actionTokenAssetId: assetId }),
  }),
  shallow
);
