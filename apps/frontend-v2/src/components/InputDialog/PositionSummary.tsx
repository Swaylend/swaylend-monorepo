import {
  useBorrowCapacity,
  useMarketBalanceOfBase,
  useMarketConfiguration,
  usePossiblePositionSummary,
  useUserCollateralValue,
  useUserSupplyBorrow,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { cn } from '@/lib/utils';
import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { ArrowDown, ArrowUp, InfoIcon } from 'lucide-react';
import React, { useMemo } from 'react';

export const PositionSummary = () => {
  const { data: marketConfiguration } = useMarketConfiguration();
  const marketBalanceOfBase = useMarketBalanceOfBase();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: collateralValue } = useUserCollateralValue();
  const { data: liquidationPoint } = useUserLiquidationPoint();

  const totalBorrowCapacity = useMemo(() => {
    if (
      !userSupplyBorrow ||
      !borrowCapacity ||
      !marketConfiguration ||
      !marketBalanceOfBase
    ) {
      return BigNumber(0);
    }

    let totalBorrowCapacity = borrowCapacity;
    if (marketBalanceOfBase.formatted.lte(borrowCapacity)) {
      totalBorrowCapacity = marketBalanceOfBase.formatted;
    }

    return formatUnits(
      userSupplyBorrow.borrowed,
      marketConfiguration.baseTokenDecimals
    ).plus(totalBorrowCapacity);
  }, [userSupplyBorrow, borrowCapacity, marketBalanceOfBase]);

  const {
    possibleBorrowCapacity,
    possibleCollateralValue,
    possibleLiquidationPoint,
    possibleAvailableToBorrow,
  } = usePossiblePositionSummary();

  const stats = useMemo(() => {
    return [
      {
        title: 'Collateral Value',
        value: `$${collateralValue?.toFixed(2)}`,
        changeValue: possibleCollateralValue
          ? `$${possibleCollateralValue.toFixed(2)}`
          : null,
        color: possibleCollateralValue?.lte(collateralValue ?? BigNumber(0))
          ? 0
          : 1,
        direction: possibleCollateralValue?.lte(collateralValue ?? BigNumber(0))
          ? 0
          : 1,
      },
      {
        title: 'Liquidation Point',
        value: `$${(liquidationPoint ?? BigNumber(0)).toFixed(2)}`,
        changeValue: possibleLiquidationPoint
          ? `$${possibleLiquidationPoint.toFixed(2)}`
          : null,
        color: possibleLiquidationPoint?.lte(liquidationPoint ?? BigNumber(0))
          ? 1
          : 0,
        direction: possibleLiquidationPoint?.lte(
          liquidationPoint ?? BigNumber(0)
        )
          ? 0
          : 1,
      },
      {
        title: 'Borrow Capacity',
        value: `${(totalBorrowCapacity ?? BigNumber(0)).toFormat(2)} USDC`,
        changeValue: possibleBorrowCapacity
          ? `${possibleBorrowCapacity.toFormat(2)} USDC`
          : null,
        color: possibleBorrowCapacity?.lte(totalBorrowCapacity ?? BigNumber(0))
          ? 0
          : 1,
        direction: possibleBorrowCapacity?.lte(
          totalBorrowCapacity ?? BigNumber(0)
        )
          ? 0
          : 1,
      },
      {
        title: 'Available to Borrow',
        value: `${(borrowCapacity ?? BigNumber(0)).toFormat(2)} USDC`,
        changeValue: possibleAvailableToBorrow
          ? `${possibleAvailableToBorrow.toFixed(2)} USDC`
          : null,
        color: possibleAvailableToBorrow?.lte(borrowCapacity ?? BigNumber(0))
          ? 0
          : 1,
        direction: possibleBorrowCapacity?.lte(
          totalBorrowCapacity ?? BigNumber(0)
        )
          ? 1
          : 0,
      },
    ];
  }, [
    totalBorrowCapacity,
    borrowCapacity,
    collateralValue,
    liquidationPoint,
    possibleAvailableToBorrow,
    possibleBorrowCapacity,
    possibleCollateralValue,
    possibleLiquidationPoint,
  ]);

  return (
    <div className="w-full flex-col flex justify-center items-center">
      <div className="text-moon flex items-center gap-x-2">
        Position Summary <InfoIcon className="w-4 h-4" />
      </div>
      <div className="w-full mt-4 flex flex-col gap-y-2">
        {stats.map((stat) => {
          return (
            <div key={stat.title} className="flex w-full justify-between">
              <div className="text-moon">{stat.title}</div>
              {stat.changeValue === null ? (
                <div className="text-lavender font-semibold">{stat.value}</div>
              ) : (
                <div
                  className={cn(
                    stat.color === 0 && 'text-red-500',
                    stat.color === 1 && 'text-primary',
                    'flex items-center gap-x-1'
                  )}
                >
                  {stat.direction ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}

                  {stat.changeValue}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
