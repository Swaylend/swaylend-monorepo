import {
  useBorrowCapacity,
  useMarketBalanceOfBase,
  useMarketConfiguration,
  usePossiblePositionSummary,
  usePrice,
  useUserCollateralUtilization,
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
import { Progress } from '../ui/progress';

export const PositionSummary = () => {
  const { data: marketConfiguration } = useMarketConfiguration();
  const marketBalanceOfBase = useMarketBalanceOfBase();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: collateralValue } = useUserCollateralValue();
  const { data: liquidationPoint } = useUserLiquidationPoint();

  const { data: priceData } = usePrice();

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
    possibleCollateralUtilization,
  } = usePossiblePositionSummary();

  const { data: collateralUtilization } = useUserCollateralUtilization();

  const currentCollateralUtilization = useMemo(() => {
    return collateralUtilization?.times(100).toNumber() ?? 0;
  }, [collateralUtilization]);

  const possibleCollateralUtilizationValue = useMemo(() => {
    if (possibleCollateralUtilization) {
      if (possibleCollateralUtilization >= 0) {
        return possibleCollateralUtilization.toFixed(2);
      }

      return '0';
    }
    return currentCollateralUtilization.toFixed(2);
  }, [possibleCollateralUtilization, currentCollateralUtilization]);

  const meterColor = useMemo(() => {
    if (Number(possibleCollateralUtilizationValue) < 60) return 'bg-primary';
    if (Number(possibleCollateralUtilizationValue) < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [possibleCollateralUtilizationValue]);

  const stats = useMemo(() => {
    let updatedBorrowCapacity = borrowCapacity?.minus(
      BigNumber(1).div(
        priceData?.prices[marketConfiguration?.baseToken.bits ?? ''] ?? 1
      )
    );

    updatedBorrowCapacity = updatedBorrowCapacity?.lt(0)
      ? BigNumber(0)
      : updatedBorrowCapacity;

    return [
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
        title: 'Collateral Value',
        tooltip: 'The total value of your collateral in $',
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
        title: 'Borrow Capacity',
        tooltip:
          'The total amount of base asset you can borrow (including borrowed amount)',
        value: `${getFormattedNumber(
          totalBorrowCapacity.minus(
            BigNumber(1).div(
              priceData?.prices[marketConfiguration?.baseToken.bits ?? ''] ?? 1
            )
          )
        )} USDC`,
        changeValue: possibleBorrowCapacity
          ? `${getFormattedNumber(
              possibleBorrowCapacity.minus(
                BigNumber(1).div(
                  priceData?.prices[
                    marketConfiguration?.baseToken.bits ?? ''
                  ] ?? 1
                )
              )
            )} USDC`
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
        value: `${getFormattedNumber(
          updatedBorrowCapacity ?? BigNumber(0)
        )} USDC`,
        changeValue: possibleAvailableToBorrow
          ? `${getFormattedNumber(
              possibleAvailableToBorrow.minus(
                BigNumber(1).div(
                  priceData?.prices[
                    marketConfiguration?.baseToken.bits ?? ''
                  ] ?? 1
                )
              )
            )} USDC`
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
    priceData,
  ]);

  return (
    <div className="w-full flex-col flex justify-center items-center">
      <div className="text-moon flex items-center gap-x-2">
        Position Summary
      </div>
      <div className="w-full mt-4 flex flex-col gap-y-2">
        <div>
          <div className="w-full flex justify-between">
            <div className="text-moon flex gap-x-1">
              Risk Meter{' '}
              <InfoIcon
                text={
                  'Shows the danger level of how close to liquidation (100%) this position is.'
                }
              />
            </div>
            <div className="text-lavender font-semibold">
              {possibleCollateralUtilizationValue}%
            </div>
          </div>
          <Progress
            value={
              possibleCollateralUtilization
                ? possibleCollateralUtilization
                : currentCollateralUtilization
            }
            className={'h-[6px] mt-2'}
            indicatorColor={meterColor}
          />
        </div>
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
