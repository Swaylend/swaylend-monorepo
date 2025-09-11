import BigNumber from 'bignumber.js';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  useBorrowCapacity,
  useMarketBalanceOfBase,
  useMarketConfiguration,
  usePossiblePositionSummary,
  usePriceData,
  useUserCollateralUtilization,
  useUserCollateralValue,
  useUserLiquidationPoint,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { cn } from '@/lib/utils';
import { formatUnits, getFormattedNumber, getFormattedPrice } from '@/utils';
import { Progress } from '../../ui/progress';
import { InfoIcon } from '../info-icon';

export const PositionSummary = () => {
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: marketBalanceOfBase } = useMarketBalanceOfBase();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: collateralValue } = useUserCollateralValue();
  const { data: liquidationPoint } = useUserLiquidationPoint();

  const { data: priceData } = usePriceData();

  const totalBorrowCapacity = useMemo(() => {
    if (
      !(
        userSupplyBorrow &&
        borrowCapacity &&
        marketConfiguration &&
        marketBalanceOfBase
      )
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

  const stats = useMemo(() => {
    const baseTokenPrice = priceData?.prices.get(
      marketConfiguration?.baseToken.bits ?? ''
    )?.[0];

    let updatedBorrowCapacity = borrowCapacity ?? BigNumber(0);

    if (baseTokenPrice?.price.gt(0)) {
      updatedBorrowCapacity = updatedBorrowCapacity.minus(
        BigNumber(1).div(baseTokenPrice.price)
      );
    }

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
          baseTokenPrice
            ? totalBorrowCapacity.minus(BigNumber(1).div(baseTokenPrice.price))
            : totalBorrowCapacity,
          4,
          true
        )} USDC`,
        changeValue: possibleBorrowCapacity
          ? `${getFormattedNumber(
              baseTokenPrice
                ? possibleBorrowCapacity.minus(
                    BigNumber(1).div(baseTokenPrice.price)
                  )
                : possibleBorrowCapacity,
              4,
              true
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
          updatedBorrowCapacity ?? BigNumber(0),
          4,
          true
        )} USDC`,
        changeValue: possibleAvailableToBorrow
          ? `${getFormattedNumber(
              baseTokenPrice
                ? possibleAvailableToBorrow.minus(
                    BigNumber(1).div(baseTokenPrice.price)
                  )
                : possibleAvailableToBorrow,
              4,
              true
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
    priceData?.timestamp,
  ]);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex items-center gap-x-2 text-moon">
        Position Summary
      </div>
      <div className="mt-4 flex w-full flex-col gap-y-2">
        <div>
          <div className="flex w-full justify-between">
            <div className="flex gap-x-1 text-moon">
              Risk Meter{' '}
              <InfoIcon
                text={
                  'Shows the danger level of how close to liquidation (100%) this position is.'
                }
              />
            </div>
            <div className="font-semibold text-lavender">
              {possibleCollateralUtilizationValue}%
            </div>
          </div>
          <Progress
            className={'mt-2 h-[6px]'}
            value={
              possibleCollateralUtilization
                ? possibleCollateralUtilization
                : currentCollateralUtilization
            }
          />
        </div>
        {stats.map((stat) => {
          return (
            <div className="flex w-full justify-between" key={stat.title}>
              <div className="flex gap-x-1 text-moon">
                {stat.title} <InfoIcon text={stat.tooltip} />
              </div>
              {stat.changeValue === null ? (
                <div className="font-semibold text-lavender">{stat.value}</div>
              ) : (
                <div
                  className={cn(
                    stat.color === 0 && 'text-red-500',
                    stat.color === 1 && 'text-primary',
                    'flex items-center gap-x-1'
                  )}
                >
                  {stat.direction ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
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
