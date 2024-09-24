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
import { formatUnits, getFormattedNumber, getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';
import { ArrowDown, ArrowUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { InfoIcon } from '../InfoIcon';

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
        tooltip: 'The total value of your collateral in USDC',
        value: `${getFormattedPrice(collateralValue ?? BigNumber(0))}`,
        changeValue: possibleCollateralValue
          ? `${getFormattedPrice(possibleCollateralValue)}`
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
        tooltip:
          'The price of supplied collateral at which your position will be liquidated',
        value: `${getFormattedPrice(liquidationPoint ?? BigNumber(0))}`,
        changeValue: possibleLiquidationPoint
          ? `${getFormattedPrice(possibleLiquidationPoint)}`
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
        tooltip:
          'The total amount of base asset you can borrow (including borrowed amount)',
        value: `${getFormattedNumber(totalBorrowCapacity)} USDC`,
        changeValue: possibleBorrowCapacity
          ? `${getFormattedNumber(possibleBorrowCapacity)} USDC`
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
        tooltip: 'The amount of base asset you can borrow',
        value: `${getFormattedNumber(borrowCapacity ?? BigNumber(0))} USDC`,
        changeValue: possibleAvailableToBorrow
          ? `${getFormattedNumber(possibleAvailableToBorrow)} USDC`
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
        Position Summary
      </div>
      <div className="w-full mt-4 flex flex-col gap-y-2">
        {stats.map((stat) => {
          return (
            <div key={stat.title} className="flex w-full justify-between">
              <div className="text-moon flex gap-x-1">
                {stat.title} <InfoIcon text={stat.tooltip} />
              </div>
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
