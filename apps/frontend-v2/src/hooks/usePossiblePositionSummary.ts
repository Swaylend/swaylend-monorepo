import { ACTION_TYPE, useMarketStore } from '@/stores';
import { formatUnits, parseUnits } from '@/utils';
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
  const collateralValue = useUserCollateralValue();
  const trueCollateralValue = useUserTrueCollateralValue();

  const [possibleBorrowCapacity, setPossibleBorrowCapacity] =
    useState<BigNumber | null>(null);
  const [possibleCollateralValue, setPossibleCollateralValue] =
    useState<BigNumber | null>(null);
  const [possibleLiquidationPoint, setPossibleLiquidationPoint] =
    useState<BigNumber | null>(null);
  const [possibleAvailableToBorrow, setPossibleAvailableToBorrow] =
    useState<BigNumber | null>(null);

  const calcPositionSummary = async () => {
    // if (!this.initialized) return;
    if (
      action == null ||
      actionTokenAssetId == null ||
      tokenAmount == null ||
      marketConfiguration == null ||
      userSupplyBorrow == null ||
      priceData == null ||
      borrowCapacity == null ||
      userCollateralAssets == null ||
      collateralConfigurations == null
    ) {
      console.log('pre ret 1');
      setPossibleBorrowCapacity(null);
      setPossibleCollateralValue(null);
      setPossibleLiquidationPoint(null);
      setPossibleAvailableToBorrow(null);
      return;
    }
    if (!tokenAmount || tokenAmount.eq(0)) {
      console.log('pre ret 2');
      setPossibleBorrowCapacity(null);
      setPossibleCollateralValue(null);
      setPossibleLiquidationPoint(null);
      setPossibleAvailableToBorrow(null);
      return;
    }

    let parsedTokenAmount = BigNumber(0);
    if (actionTokenAssetId === marketConfiguration.baseToken) {
      parsedTokenAmount = parseUnits(
        tokenAmount,
        marketConfiguration?.baseTokenDecimals ?? 9
      );
    } else {
      parsedTokenAmount = parseUnits(
        tokenAmount,
        collateralConfigurations[actionTokenAssetId].decimals ?? 9
      );
    }

    const loanAmount = userSupplyBorrow.borrowed ?? BigNumber(0);

    if (action === ACTION_TYPE.BORROW) {
      const baseTokenPrice = priceData.prices[marketConfiguration.baseToken];
      const newLoanValue = formatUnits(
        loanAmount.plus(parsedTokenAmount),
        marketConfiguration?.baseTokenDecimals ?? 9
      ).times(baseTokenPrice);

      const collateralUtilization = newLoanValue.div(
        trueCollateralValue ?? BigNumber(0)
      );
      const userPositionLiquidationPoint = (
        collateralValue ?? BigNumber(0)
      ).times(collateralUtilization);
      if (userPositionLiquidationPoint.lt(BigNumber(0))) {
        setPossibleLiquidationPoint(BigNumber(0));
      } else {
        setPossibleLiquidationPoint(userPositionLiquidationPoint);
      }

      const availableToBorrowChange = borrowCapacity.minus(
        tokenAmount ?? BigNumber(0)
      );
      if (availableToBorrowChange.lt(0)) {
        setPossibleAvailableToBorrow(BigNumber(0));
      } else {
        setPossibleAvailableToBorrow(availableToBorrowChange);
      }
    }

    if (action === ACTION_TYPE.REPAY) {
      const baseTokenPrice = priceData.prices[marketConfiguration.baseToken];
      const newLoanValue = formatUnits(
        loanAmount.minus(parsedTokenAmount),
        marketConfiguration?.baseTokenDecimals ?? 9
      ).times(baseTokenPrice);

      const collateralUtilization = newLoanValue.div(
        trueCollateralValue ?? BigNumber(0)
      );
      const userPositionLiquidationPoint = (
        collateralValue ?? BigNumber(0)
      ).times(collateralUtilization);
      if (userPositionLiquidationPoint.lt(BigNumber(0))) {
        setPossibleLiquidationPoint(BigNumber(0));
      } else {
        setPossibleLiquidationPoint(userPositionLiquidationPoint);
      }

      const availableToBorrowChange = borrowCapacity.plus(
        tokenAmount ?? BigNumber(0)
      );
      if (availableToBorrowChange.lt(0)) {
        setPossibleAvailableToBorrow(BigNumber(0));
      } else {
        setPossibleAvailableToBorrow(availableToBorrowChange);
      }
    }

    if (action === ACTION_TYPE.SUPPLY) {
      if (
        actionTokenAssetId !== marketConfiguration.baseToken &&
        userCollateralAssets &&
        collateralConfigurations
      ) {
        console.log('hereowsky', userCollateralAssets);

        let collateralsValue = BigNumber(0);
        let newBorrowCapacity = BigNumber(0);

        // If array is empty
        if (Object.keys(userCollateralAssets).length === 0) {
          const dollValue = tokenAmount.times(
            priceData.prices[actionTokenAssetId]
          );
          collateralsValue = collateralsValue.plus(dollValue);
          const tokenBorrowCollateralFactor = formatUnits(
            BigNumber(
              collateralConfigurations[
                actionTokenAssetId
              ].borrow_collateral_factor.toString()
            ),
            18
          );
          newBorrowCapacity = newBorrowCapacity.plus(
            dollValue.times(tokenBorrowCollateralFactor)
          );
        }
        // Get collaterals value
        else {
          collateralsValue = Object.entries(userCollateralAssets).reduce(
            (acc, [assetId, v]) => {
              const token = collateralConfigurations[assetId];
              let balance = v;
              if (assetId === actionTokenAssetId) {
                balance = balance.plus(parsedTokenAmount ?? BigNumber(0));
              }
              balance = formatUnits(balance, token.decimals);
              const dollBalance = priceData.prices[assetId].times(balance);
              return acc.plus(dollBalance);
            },
            BigNumber(0)
          );

          newBorrowCapacity = Object.entries(userCollateralAssets).reduce(
            (acc, [assetId, v]) => {
              const token = collateralConfigurations[assetId];
              const tokenBorrowCollateralFactor = formatUnits(
                BigNumber(
                  collateralConfigurations[
                    assetId
                  ].borrow_collateral_factor.toString()
                ),
                18
              );
              let balance = v;
              if (assetId === actionTokenAssetId) {
                balance = balance.plus(parsedTokenAmount ?? BigNumber(0));
              }
              balance = formatUnits(balance, token.decimals);
              const dollBalance = priceData.prices[assetId]
                .times(balance)
                .times(tokenBorrowCollateralFactor);
              return acc.plus(dollBalance);
            },
            BigNumber(0)
          );
        }

        setPossibleCollateralValue(collateralsValue);
        setPossibleBorrowCapacity(newBorrowCapacity);
        const newAvailableToBorrow = newBorrowCapacity.minus(
          formatUnits(
            userSupplyBorrow.borrowed ?? BigNumber(0),
            marketConfiguration?.baseTokenDecimals ?? 9
          )
        );
        if (newAvailableToBorrow.lt(0)) {
          setPossibleAvailableToBorrow(BigNumber(0));
        } else {
          setPossibleAvailableToBorrow(newAvailableToBorrow);
        }
      }
    }

    if (action === ACTION_TYPE.WITHDRAW) {
      if (
        actionTokenAssetId !== marketConfiguration.baseToken &&
        userCollateralAssets &&
        collateralConfigurations
      ) {
        // Get collaterals value
        const collateralsValue = Object.entries(userCollateralAssets).reduce(
          (acc, [assetId, v]) => {
            const token = collateralConfigurations[assetId];
            let balance = v;
            if (assetId === actionTokenAssetId) {
              balance = balance.minus(parsedTokenAmount ?? BigNumber(0));
            }
            balance = formatUnits(balance, token.decimals);
            const dollBalance = priceData.prices[assetId].times(balance);
            return acc.plus(dollBalance);
          },
          BigNumber(0)
        );

        const newBorrowCapacity = Object.entries(userCollateralAssets).reduce(
          (acc, [assetId, v]) => {
            const token = collateralConfigurations[assetId];
            const tokenBorrowCollateralFactor = formatUnits(
              BigNumber(
                collateralConfigurations[
                  assetId
                ].borrow_collateral_factor.toString()
              ),
              18
            );
            let balance = v;
            if (assetId === actionTokenAssetId) {
              balance = balance.minus(parsedTokenAmount ?? BigNumber(0));
            }
            balance = formatUnits(balance, token.decimals);
            const dollBalance = priceData.prices[assetId]
              .times(balance)
              .times(tokenBorrowCollateralFactor);
            return acc.plus(dollBalance);
          },
          BigNumber(0)
        );

        setPossibleCollateralValue(collateralsValue);
        setPossibleBorrowCapacity(newBorrowCapacity);
        const newAvailableToBorrow = newBorrowCapacity.minus(
          formatUnits(
            userSupplyBorrow.borrowed ?? BigNumber(0),
            marketConfiguration?.baseTokenDecimals ?? 9
          )
        );
        if (newAvailableToBorrow.lt(0)) {
          setPossibleAvailableToBorrow(BigNumber(0));
        } else {
          setPossibleAvailableToBorrow(newAvailableToBorrow);
        }
      }
      return;
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
