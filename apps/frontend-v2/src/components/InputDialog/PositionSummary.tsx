import {
  useBorrowCapacity,
  useMarketConfiguration,
  usePossiblePositionSummary,
  useUserCollateralValue,
  useUserSupplyBorrow,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { ArrowDown, ArrowUp, InfoIcon } from 'lucide-react';
import React, { useMemo } from 'react';

export const PositionSummary = () => {
  const { data: marketConfiguration } = useMarketConfiguration();
  //TODO -> Borrow capacity cant be higher than the amount of base asset in market contract... Check balance of base asset in market contract
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: collateralValue } = useUserCollateralValue();
  const { data: liquidationPoint } = useUserLiquidationPoint();

  const totalBorrowCapacity = useMemo(() => {
    if (!userSupplyBorrow || !borrowCapacity || !marketConfiguration) {
      return BigNumber(0);
    }

    return formatUnits(
      userSupplyBorrow.borrowed,
      marketConfiguration.baseTokenDecimals
    ).plus(borrowCapacity);
  }, [userSupplyBorrow, borrowCapacity]);

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
      <div className="text-neutral4 flex items-center gap-x-2">
        Position Summary <InfoIcon className="w-4 h-4" />
      </div>
      <div className="w-full mt-4 flex flex-col gap-y-2">
        {stats.map((stat) => {
          return (
            <div key={stat.title} className="flex w-full justify-between">
              <div>{stat.title}</div>
              {stat.changeValue === null ? (
                <div className="text-accent">{stat.value}</div>
              ) : (
                <div
                  className={`${stat.color === 0 && 'text-red-500'} ${stat.color === 1 && 'text-primary03'} flex items-center gap-x-1`}
                >
                  {stat.color === 0 && stat.title !== 'Liquidation Point' && <ArrowDown className="w-4 h-4" />}
                  {stat.color === 1 && stat.title !== 'Liquidation Point' && <ArrowUp className="w-4 h-4" />}
                  {stat.color === 1 && stat.title === 'Liquidation Point' && <ArrowDown className="w-4 h-4" />}
                  {stat.color === 0 && stat.title === 'Liquidation Point' && <ArrowUp className="w-4 h-4" />}
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
