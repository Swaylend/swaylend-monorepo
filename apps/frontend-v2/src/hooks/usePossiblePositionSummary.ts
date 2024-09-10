import { ACTION_TYPE, useMarketStore } from '@/stores';
import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { useMemo, useState } from 'react';
import { useBorrowCapacity } from './useBorrowCapacity';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { useUserCollateralValue } from './useUserCollateralValue';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';
import { useUserTrueCollateralValue } from './useUserTrueCollateralValue';

export const usePossiblePositionSummary = () => {
  const { actionTokenAssetId, tokenAmount, action } = useMarketStore();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  //TODO -> Borrow capacity cant be higher than the amount of base asset in market contract... Check balance of base asset in market contract
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: collateralValue } = useUserCollateralValue();
  const { data: trueCollateralValue } = useUserTrueCollateralValue();

  const [possibleBorrowCapacity, setPossibleBorrowCapacity] =
    useState<BigNumber | null>(null);
  const [possibleCollateralValue, setPossibleCollateralValue] =
    useState<BigNumber | null>(null);
  const [possibleLiquidationPoint, setPossibleLiquidationPoint] =
    useState<BigNumber | null>(null);
  const [possibleAvailableToBorrow, setPossibleAvailableToBorrow] =
    useState<BigNumber | null>(null);

  const calcPositionSummary = async () => {
    if (
      action == null ||
      actionTokenAssetId == null ||
      marketConfiguration == null ||
      userSupplyBorrow == null ||
      priceData == null ||
      borrowCapacity == null ||
      userCollateralAssets == null ||
      collateralConfigurations == null ||
      tokenAmount.eq(0)
    ) {
      setPossibleBorrowCapacity(null);
      setPossibleCollateralValue(null);
      setPossibleLiquidationPoint(null);
      setPossibleAvailableToBorrow(null);
      return;
    }

    let loanAmount = formatUnits(
      userSupplyBorrow.borrowed,
      marketConfiguration.baseTokenDecimals
    );

    if (action === ACTION_TYPE.REPAY || action === ACTION_TYPE.BORROW) {
      if (!trueCollateralValue || !collateralValue) {
        setPossibleBorrowCapacity(null);
        setPossibleCollateralValue(null);
        setPossibleLiquidationPoint(null);
        setPossibleAvailableToBorrow(null);
        return;
      }

      const baseTokenPrice = priceData.prices[marketConfiguration.baseToken];

      loanAmount = loanAmount
        .plus(tokenAmount.times(action === ACTION_TYPE.BORROW ? 1 : -1))
        .times(baseTokenPrice);

      const collateralUtilization = trueCollateralValue.eq(0)
        ? BigNumber(0)
        : loanAmount.div(trueCollateralValue);

      const userPositionLiquidationPoint = collateralValue.times(
        collateralUtilization
      );

      setPossibleLiquidationPoint(
        userPositionLiquidationPoint.lt(BigNumber(0))
          ? BigNumber(0)
          : userPositionLiquidationPoint
      );

      const availableToBorrowChange =
        action === ACTION_TYPE.BORROW
          ? borrowCapacity.minus(tokenAmount)
          : borrowCapacity.plus(tokenAmount);

      setPossibleAvailableToBorrow(
        availableToBorrowChange.lt(0) ? BigNumber(0) : availableToBorrowChange
      );
    }

    if (action === ACTION_TYPE.SUPPLY || action === ACTION_TYPE.WITHDRAW) {
      if (
        actionTokenAssetId === marketConfiguration.baseToken ||
        !collateralValue
      ) {
        setPossibleBorrowCapacity(null);
        setPossibleCollateralValue(null);
        setPossibleLiquidationPoint(null);
        setPossibleAvailableToBorrow(null);
        return;
      }

      // Existing collateral value +/- (token supplied * price * borrow_collateral_factor)
      const collateralsValue = collateralValue.plus(
        tokenAmount
          .times(priceData.prices[actionTokenAssetId])
          .times(action === ACTION_TYPE.SUPPLY ? 1 : -1)
      );

      // Existing borrow capacity +/- (token supplied * price * borrow_collateral_factor) + borrwed_amount
      const newAvailableToBorrow = borrowCapacity.plus(
        tokenAmount
          .times(priceData.prices[actionTokenAssetId])
          .times(
            formatUnits(
              BigNumber(
                collateralConfigurations[
                  actionTokenAssetId
                ].borrow_collateral_factor.toString()
              ),
              18
            )
          )
          .times(action === ACTION_TYPE.SUPPLY ? 1 : -1)
      );

      const newBorrowCapacity = newAvailableToBorrow.plus(loanAmount);

      setPossibleCollateralValue(collateralsValue);
      setPossibleBorrowCapacity(
        newBorrowCapacity.lt(0) ? BigNumber(0) : newBorrowCapacity
      );
      setPossibleAvailableToBorrow(
        newAvailableToBorrow.lt(0) ? BigNumber(0) : newAvailableToBorrow
      );
    }
  };

  useMemo(() => {
    calcPositionSummary();
  }, [actionTokenAssetId, tokenAmount, action]);

  return {
    possibleBorrowCapacity,
    possibleCollateralValue,
    possibleLiquidationPoint,
    possibleAvailableToBorrow,
  };
};
