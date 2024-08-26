import BigNumber from 'bignumber.js';
import { formatUnits } from './BigNumber';
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from './constants';

export function getBorrowApr(borrowRate: BigNumber | null | undefined) {
  if (borrowRate == null) return '0.00';
  const rate = new BigNumber(borrowRate);
  const coefficient = new BigNumber(365)
    .times(24)
    .times(60)
    .times(60)
    .times(100);
  return `${formatUnits(rate.times(coefficient), 18).toFormat(2)}%`;
}

export function getSupplyApr(supplyRate: BigNumber | null | undefined) {
  if (supplyRate == null) return '0.00';
  const rate = new BigNumber(supplyRate);
  const coefficient = new BigNumber(365)
    .times(24)
    .times(60)
    .times(60)
    .times(100);
  return `${formatUnits(rate.times(coefficient), 18).toFormat(2)}%`;
}

// export function getTrueTotalCollateralBalance(
//   collateralBalances: Record<string, BigNumber> | undefined,
//   assetsConfigs: Record<string, CollateralConfigurationOutput> | undefined,
//   getTokenPrice: (assetId: string) => BigNumber
// ) {
//   if (collateralBalances == null || assetsConfigs == null) return BigNumber.ZERO;
//   const trueCollateralsValue = Object.entries(collateralBalances).reduce(
//     (acc, [assetId, v]) => {
//       const token = TOKENS_BY_ASSET_ID[assetId];
//       const liquidationFactor = BigNumber.formatUnits(
//         assetsConfigs[assetId].liquidate_collateral_factor.toString(),
//         18
//       );
//       const balance = BigNumber.formatUnits(v, token.decimals);
//       const dollBalance = getTokenPrice(assetId).times(balance);
//       const trueDollBalance = dollBalance.times(liquidationFactor);
//       return acc.plus(trueDollBalance);
//     },
//     BigNumber.ZERO
//   );
//   return trueCollateralsValue;
// }

export function getTotalCollateralBalance(
  collateralBalances: Record<string, BigNumber>,
  prices: Record<string, BigNumber>
) {
  if (collateralBalances == null) return new BigNumber(0);
  const totalCollateralBalance = Object.entries(collateralBalances).reduce(
    (acc, [assetId, v]) => {
      const token = TOKENS_BY_ASSET_ID[assetId];
      const balance = formatUnits(v, token.decimals);
      const dollBalance = (prices[assetId] ?? new BigNumber(0)).times(balance);
      return acc.plus(dollBalance);
    },
    new BigNumber(0)
  );
  return totalCollateralBalance;
}

export function getTotalSuppliedBalance(
  suppliedBalance: BigNumber | null,
  collateralBalances: Record<string, BigNumber>,
  prices: Record<string, BigNumber>
) {
  const baseTokenBalance = formatUnits(
    suppliedBalance ?? new BigNumber(0),
    TOKENS_BY_SYMBOL.USDC.decimals
  );
  const baseTokenPrice =
    prices[TOKENS_BY_SYMBOL.USDC.assetId] ?? new BigNumber(0);
  const totalCollBalance = getTotalCollateralBalance(
    collateralBalances,
    prices
  );
  return baseTokenBalance
    .times(baseTokenPrice)
    .plus(totalCollBalance)
    .toFormat(2);
}
