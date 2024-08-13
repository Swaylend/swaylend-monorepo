import { type IToken, TOKENS_BY_ASSET_ID } from '@src/constants';
import type { CollateralConfigurationOutput } from '@src/contract-types/MarketAbi';
import BN from './BN';

export function getBorrowApr(borrowRate: BN | null | undefined) {
  if (borrowRate == null) return '0.00';
  const rate = BN.formatUnits(borrowRate, 18);
  const coefficient = new BN(365).times(24).times(60).times(60).times(100);
  return `${rate.times(coefficient).toFormat(2)}%`;
}

export function getSupplyApr(supplyRate: BN | null | undefined) {
  if (supplyRate == null) return '0.00';
  const rate = BN.formatUnits(supplyRate, 18);
  const coefficient = new BN(365).times(24).times(60).times(60).times(100);
  return `${rate.times(coefficient).toFormat(2)}%`;
}

export function getPossibleBorrowApr(possibleBorrowRate: BN | null) {
  if (possibleBorrowRate == null) return null;
  const rate = BN.formatUnits(possibleBorrowRate, 18);
  const coefficient = new BN(365).times(24).times(60).times(60).times(100);
  return `${rate.times(coefficient).toFormat(2)}%`;
}

export function getPossibleSupplyApr(possibleSupplyRate: BN | null) {
  if (possibleSupplyRate == null) return null;
  const rate = BN.formatUnits(possibleSupplyRate, 18);
  const coefficient = new BN(365).times(24).times(60).times(60).times(100);
  return `${rate.times(coefficient).toFormat(2)}%`;
}

export function getTrueTotalCollateralBalance(
  collateralBalances: Record<string, BN> | undefined,
  assetsConfigs: Record<string, CollateralConfigurationOutput> | undefined,
  getTokenPrice: (assetId: string) => BN
) {
  if (collateralBalances == null || assetsConfigs == null) return BN.ZERO;
  const trueCollateralsValue = Object.entries(collateralBalances).reduce(
    (acc, [assetId, v]) => {
      const token = TOKENS_BY_ASSET_ID[assetId];
      const liquidationFactor = BN.formatUnits(
        assetsConfigs[assetId].liquidate_collateral_factor.toString(),
        18
      );
      const balance = BN.formatUnits(v, token.decimals);
      const dollBalance = getTokenPrice(assetId).times(balance);
      const trueDollBalance = dollBalance.times(liquidationFactor);
      return acc.plus(trueDollBalance);
    },
    BN.ZERO
  );
  return trueCollateralsValue;
}

export function getTotalCollateralBalance(
  collateralBalances: Record<string, BN> | undefined,
  getTokenPrice: (assetId: string) => BN
) {
  if (collateralBalances == null) return BN.ZERO;
  const totalCollateralBalance = Object.entries(collateralBalances).reduce(
    (acc, [assetId, v]) => {
      const token = TOKENS_BY_ASSET_ID[assetId];
      const balance = BN.formatUnits(v, token.decimals);
      const dollBalance = getTokenPrice(assetId).times(balance);
      return acc.plus(dollBalance);
    },
    BN.ZERO
  );
  return totalCollateralBalance;
}

export function getTotalSuppliedBalance(
  initialized: boolean,
  baseToken: IToken,
  suppliedBalance: BN | null,
  collateralBalances: Record<string, BN> | undefined,
  getTokenPrice: (assetId: string) => BN
) {
  if (!initialized || collateralBalances == null) return '0.00';
  const baseTokenBalance = BN.formatUnits(
    suppliedBalance ?? BN.ZERO,
    baseToken.decimals
  );
  const baseTokenPrice = getTokenPrice(baseToken.assetId);
  const totalCollBalance = getTotalCollateralBalance(
    collateralBalances,
    getTokenPrice
  );
  return baseTokenBalance
    .times(baseTokenPrice)
    .plus(totalCollBalance)
    .toFormat(2);
}

const currentAssetConfig = (
  actionTokenAssetId: string,
  assetsConfigs: Record<string, CollateralConfigurationOutput> | undefined
) => {
  if (actionTokenAssetId == null || assetsConfigs == null) return null;
  return assetsConfigs[actionTokenAssetId];
};

const currentAssetCollateralReserve = (
  actionTokenAssetId: string,
  collateralReserves: Record<string, BN> | undefined
) => {
  if (actionTokenAssetId == null || collateralReserves == null) return null;
  return collateralReserves[actionTokenAssetId];
};

export function currentAssetCollateralCapacityLeft(
  actionTokenAssetId: string | null,
  assetsConfigs: Record<string, CollateralConfigurationOutput> | undefined,
  collateralReserves: Record<string, BN> | undefined
) {
  if (actionTokenAssetId == null) return null;

  const currAssetConfig = currentAssetConfig(actionTokenAssetId, assetsConfigs);
  const currAssetCollateralReserve = currentAssetCollateralReserve(
    actionTokenAssetId,
    collateralReserves
  );

  if (currAssetCollateralReserve == null || currAssetConfig == null)
    return null;
  return new BN(currAssetConfig.supply_cap.toString()).minus(
    currAssetCollateralReserve
  );
}
