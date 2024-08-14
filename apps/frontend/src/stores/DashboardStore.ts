import {
  type IToken,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from '@src/constants';
import type { CollateralConfigurationOutput } from '@src/contract-types/MarketAbi';
import BN from '@src/utils/BN';
import type RootStore from '@stores/RootStore';
import { makeAutoObservable } from 'mobx';

export enum ACTION_TYPE {
  SUPPLY = 'SUPPLY',
  BORROW = 'BORROW',
  REPAY = 'REPAY',
  WITHDRAW = 'WITHDRAW',
}

class DashboardStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  mode: 0 | 1 = 0;
  setMode = (v: 0 | 1) => {
    this.mode = v;
  };

  loading = false;
  setLoading = (l: boolean) => {
    this.loading = l;
  };

  action: ACTION_TYPE | null = null;
  setAction = (l: ACTION_TYPE | null) => {
    this.action = l;
  };

  tokenAmount: BN | null = null;
  setTokenAmount = (l: BN | null) => {
    this.tokenAmount = l;
  };

  actionTokenAssetId: string | null = null;
  setActionTokenAssetId = (l: string | null) => {
    this.actionTokenAssetId = l;
  };

  possibleBorrowRate: BN | null = null;
  setPossibleBorrowRate = (l: BN | null) => {
    this.possibleBorrowRate = l;
  };

  possibleSupplyRate: BN | null = null;
  setPossibleSupplyRate = (l: BN | null) => {
    this.possibleSupplyRate = l;
  };

  get actionToken() {
    if (this.actionTokenAssetId == null) return TOKENS_BY_SYMBOL.USDC;
    return TOKENS_BY_ASSET_ID[this.actionTokenAssetId];
  }

  get baseToken() {
    return TOKENS_BY_SYMBOL.USDC;
  }

  get allTokens() {
    return [this.baseToken.assetId, ...this.collaterals.map((c) => c.assetId)];
  }

  get operationName() {
    switch (this.action) {
      case ACTION_TYPE.SUPPLY:
        return 'Supply';
      case ACTION_TYPE.BORROW:
        return 'Borrow';
      case ACTION_TYPE.REPAY:
        return 'Repay';
      case ACTION_TYPE.WITHDRAW:
        return 'Withdraw';
    }
    return '';
  }

  notification(currentAssetCollateralCapacityLeft: BN | null) {
    if (this.action == null || currentAssetCollateralCapacityLeft == null)
      return null;
    if (this.action !== ACTION_TYPE.SUPPLY) return null;
    if (currentAssetCollateralCapacityLeft == null) return null;
    if (currentAssetCollateralCapacityLeft.eq(0)) {
      return `You can't supply more ${this.actionToken.symbol} because supply capacity is reached`;
    }
    return null;
  }

  currentAssetConfig(
    assetsConfigs: Record<string, CollateralConfigurationOutput> | null
  ) {
    if (this.actionTokenAssetId == null || assetsConfigs == null) return null;
    return assetsConfigs[this.actionTokenAssetId];
  }

  currentAssetCollateralReserve(collateralReserves: Record<string, BN> | null) {
    if (this.actionTokenAssetId == null || collateralReserves == null)
      return null;
    return collateralReserves[this.actionTokenAssetId];
  }

  currentAssetCollateralCapacityLeft(
    assetsConfigs: Record<string, CollateralConfigurationOutput> | null,
    collateralReserves: Record<string, BN> | null
  ) {
    const currentAssetConfig = this.currentAssetConfig(assetsConfigs);
    const currentAssetCollateralReserve =
      this.currentAssetCollateralReserve(collateralReserves);
    if (currentAssetConfig == null || currentAssetCollateralReserve == null)
      return null;
    return new BN(currentAssetConfig.supply_cap.toString()).minus(
      currentAssetCollateralReserve
    );
  }

  collaterals: IToken[] = [
    TOKENS_BY_SYMBOL.ETH,
    TOKENS_BY_SYMBOL.BTC,
    TOKENS_BY_SYMBOL.UNI,
  ];
}

export default DashboardStore;
