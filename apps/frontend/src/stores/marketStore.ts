import { appConfig } from '@/configs';
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
  market: string;

  mode: ACTION_MODE;
  marketMode: MARKET_MODE;
  action: ACTION_TYPE | null | undefined;
  tokenAmount: BigNumber;
  actionTokenAssetId: string | null | undefined;
  inputDialogOpen: boolean;
  successDialogOpen: boolean;
  successDialogTransactionId: string | null;

  changeMarket: (market: string) => void;
  changeMode: (mode: ACTION_MODE) => void;
  changeMarketMode: (mode: MARKET_MODE) => void;
  changeAction: (action: ACTION_TYPE | null | undefined) => void;
  changeTokenAmount: (tokenAmount: BigNumber) => void;
  changeActionTokenAssetId: (assetId: string | null | undefined) => void;
  changeInputDialogOpen: (open: boolean) => void;
  changeSuccessDialogOpen: (open: boolean) => void;
  changeSuccessDialogTransactionId: (transactionId: string | null) => void;
}

export const marketStoreInitialState = {
  market: Object.keys(appConfig.markets)[0],
  mode: 0,
  marketMode: MARKET_MODE.BORROW,
  action: null,
  tokenAmount: new BigNumber(0),
  actionTokenAssetId: null,
  inputDialogOpen: false,
  successDialogOpen: false,
  successDialogTransactionId: null,
};

export const useMarketStore = createWithEqualityFn<MarketStore>()(
  (set) => ({
    ...marketStoreInitialState,

    changeMarket: (market: string) => set({ market }),
    changeInputDialogOpen: (open: boolean) => set({ inputDialogOpen: open }),
    changeMode: (mode: ACTION_MODE) => set({ mode }),
    changeMarketMode: (mode: MARKET_MODE) => set({ marketMode: mode }),
    changeAction: (action: ACTION_TYPE | null | undefined) => set({ action }),
    changeTokenAmount: (tokenAmount: BigNumber) => set({ tokenAmount }),
    changeActionTokenAssetId: (assetId: string | null | undefined) =>
      set({ actionTokenAssetId: assetId }),
    changeSuccessDialogOpen: (open: boolean) =>
      set({ successDialogOpen: open }),
    changeSuccessDialogTransactionId: (transactionId: string | null) =>
      set({ successDialogTransactionId: transactionId }),
  }),
  shallow
);

// Always only select individual fields when using `shallow`, or it will always trigger a new render since technically it's a new object.
// In general, best practice is to always use selectors and for individual fields only.
export const selectMarket = (state: MarketStore) => state.market;
export const selectMode = (state: MarketStore) => state.mode;
export const selectMarketMode = (state: MarketStore) => state.marketMode;
export const selectAction = (state: MarketStore) => state.action;
export const selectTokenAmount = (state: MarketStore) => state.tokenAmount;
export const selectActionTokenAssetId = (state: MarketStore) =>
  state.actionTokenAssetId;
export const selectChangeMarketMode = (state: MarketStore) =>
  state.changeMarketMode;
export const selectChangeInputDialogOpen = (state: MarketStore) =>
  state.changeInputDialogOpen;
export const selectChangeSuccessDialogOpen = (state: MarketStore) =>
  state.changeSuccessDialogOpen;
export const selectChangeSuccessDialogTransactionId = (state: MarketStore) =>
  state.changeSuccessDialogTransactionId;
export const selectChangeAction = (state: MarketStore) => state.changeAction;
export const selectChangeTokenAmount = (state: MarketStore) =>
  state.changeTokenAmount;
export const selectChangeActionTokenAssetId = (state: MarketStore) =>
  state.changeActionTokenAssetId;
export const selectChangeMode = (state: MarketStore) => state.changeMode;
export const selectInputDialogOpen = (state: MarketStore) =>
  state.inputDialogOpen;
export const selectChangeMarket = (state: MarketStore) => state.changeMarket;
export const selectSuccessDialogOpen = (state: MarketStore) =>
  state.successDialogOpen;
export const selectSuccessDialogTransactionId = (state: MarketStore) =>
  state.successDialogTransactionId;
