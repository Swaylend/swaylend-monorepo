import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';
import { usePriceData } from './oracles';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserCollateralAssets } from './use-user-collateral-assets';
import { useUserSupplyBorrow } from './use-user-supply-borrow';

// Value of collateral in USD times the liquidation factor
export const useMaxWithdrawableCollateral = (
  assetId: string | null | undefined
) => {
  const { data: collateralBalances } = useUserCollateralAssets();
  const { data: collateralConfig } = useCollateralConfigurations();
  const { data: priceData } = usePriceData();
  const { data: supplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();

  return useQuery({
    queryKey: [
      'userMaxWithdrawableCollateral',
      'v2',
      assetId,
      collateralBalances,
      collateralConfig,
      supplyBorrow,
      priceData?.timestamp,
      marketConfiguration,
    ],
    queryFn: () => {
      if (
        collateralBalances == null ||
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
          collateralConfig[assetId].decimals
        );
      }

      const baseTokenPrice =
        priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]?.price ??
        BigNumber(0);

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
          BigNumber(collateralConfig![id].borrow_collateral_factor.toString()),
          18
        );
        const balance = formatUnits(v, token.decimals);
        const assetPrice = priceData.prices.get(id)?.[0]?.price ?? BigNumber(0);
        const dollBalance = assetPrice.times(balance);
        const trueDollBalance = dollBalance.times(collateralFactor);
        return acc.plus(trueDollBalance);
      }, BigNumber(0));

      // BorrowCollateral Asset balance
      const currentBalance = formatUnits(
        BigNumber(collateralBalances?.[assetId ?? ''] ?? new BigNumber(0)),
        collateralConfig?.[assetId ?? '']?.decimals
      );
      const borrowCollateralFactor = formatUnits(
        BigNumber(
          collateralConfig![assetId!].borrow_collateral_factor.toString()
        ),
        18
      );

      const assetPrice =
        priceData.prices.get(assetId)?.[0]?.price ?? BigNumber(0);

      const borrowCollateralValueCurrent = assetPrice
        .times(currentBalance)
        .times(borrowCollateralFactor);

      const currentBorrowValue = formatUnits(
        supplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      ).times(baseTokenPrice);

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
        .div(assetPrice);

      if (
        allowedCollateralAmountToWithdraw.isNaN() ||
        allowedCollateralAmountToWithdraw.isNegative()
      ) {
        return BigNumber(0);
      }

      return allowedCollateralAmountToWithdraw.times(0.99);
    },
    enabled:
      !!collateralBalances &&
      !!collateralConfig &&
      !!priceData &&
      !!assetId &&
      !!supplyBorrow &&
      !!marketConfiguration,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
