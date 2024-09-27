import { formatUnits } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';

// Value of collateral in USD times the liquidation factor
export const useMaxWithdrawableCollateral = (
  assetId: string | null | undefined
) => {
  const { data: assetsConfigs } = useCollateralConfigurations();
  const { data: collateralBalances } = useUserCollateralAssets();
  const { data: collateralConfig } = useCollateralConfigurations();
  const { data: priceData } = usePrice();
  const { data: supplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();

  return useQuery({
    queryKey: [
      'userMaxWithdrawableCollateral',
      assetId,
      collateralBalances,
      assetsConfigs,
      collateralConfig,
      supplyBorrow,
      priceData?.prices,
      marketConfiguration,
    ],
    queryFn: async () => {
      if (
        collateralBalances == null ||
        assetsConfigs == null ||
        priceData == null ||
        collateralConfig == null ||
        assetId == null ||
        supplyBorrow == null ||
        marketConfiguration == null
      ) {
        return null;
      }

      if (!supplyBorrow.borrowed || supplyBorrow.borrowed.isZero()) {
        return formatUnits(
          BigNumber(collateralBalances[assetId]),
          assetsConfigs[assetId].decimals
        );
      }

      // Borrowed amount
      // Borrow Collateral value of other assets
      const borrowCollateralValueOthers = Object.entries(
        collateralBalances
      ).reduce((acc, [id, v]) => {
        if (id === assetId) {
          return acc;
        }
        const token = collateralConfig[id];
        const collateralFactor = formatUnits(
          BigNumber(assetsConfigs![id].borrow_collateral_factor.toString()),
          18
        );
        const balance = formatUnits(v, token.decimals);
        const dollBalance = priceData.prices[id].times(balance);
        const trueDollBalance = dollBalance.times(collateralFactor);
        return acc.plus(trueDollBalance);
      }, BigNumber(0));

      // BorrowCollateral Asset balance
      const currentBalance = formatUnits(
        BigNumber(collateralBalances?.[assetId ?? ''] ?? new BigNumber(0)),
        assetsConfigs?.[assetId ?? '']?.decimals
      );
      const borrowCollateralFactor = formatUnits(
        BigNumber(assetsConfigs![assetId!].borrow_collateral_factor.toString()),
        18
      );
      const borrowCollateralValueCurrent = priceData.prices[assetId]
        .times(currentBalance)
        .times(borrowCollateralFactor);

      const currentBorrowValue = formatUnits(
        supplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      ).times(priceData.prices[marketConfiguration.baseToken.bits]);

      // Collateral value needed to be covered by the current asset
      const collateralValueNeeded = currentBorrowValue;

      // If Other Assets are enough to cover the collateral value needed
      if (borrowCollateralValueOthers.gt(collateralValueNeeded)) {
        return currentBalance;
      }

      // Collateral value needed to be covered by this Asset
      const neededBorrowCollateralValue = collateralValueNeeded.minus(
        borrowCollateralValueOthers
      );

      // Calculate the amount of collateral that can be withdrawn
      const allowedCollateralValueToWithdraw =
        borrowCollateralValueCurrent.minus(neededBorrowCollateralValue);

      // Convert allowedCollateralValueToWithdraw to the corresponding token amount
      const allowedCollateralAmountToWithdraw = allowedCollateralValueToWithdraw
        .div(borrowCollateralFactor)
        .div(priceData.prices[assetId]);

      if (
        allowedCollateralAmountToWithdraw.isNaN() ||
        allowedCollateralAmountToWithdraw.isNegative()
      ) {
        return BigNumber(0);
      }

      return allowedCollateralAmountToWithdraw;
    },
    enabled:
      !!collateralBalances &&
      !!assetsConfigs &&
      !!collateralConfig &&
      !!priceData &&
      !!assetId &&
      !!supplyBorrow &&
      !!marketConfiguration,
    refetchOnWindowFocus: false,
  });
};
