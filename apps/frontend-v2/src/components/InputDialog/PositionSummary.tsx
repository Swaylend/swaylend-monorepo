import {
  useBorrowCapacity,
  useCollateralConfigurations,
  useMarketConfiguration,
  usePossiblePositionSummary,
  usePrice,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserCollateralValue,
  useUserSupplyBorrow,
  useUserTrueCollateralValue,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { formatUnits } from '@/utils';
import { useAccount } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { InfoIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export const PositionSummary = () => {
  const { account } = useAccount();
  const { data: priceData } = usePrice();

  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  //TODO -> Borrow capacity cant be higher than the amount of base asset in market contract... Check balance of base asset in market contract
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const collateralValue = useUserCollateralValue();
  const trueCollateralValue = useUserTrueCollateralValue();
  const collateralUtilization = useUserCollateralUtilization();
  const liquidationPoint = useUserLiquidationPoint();

  const totalBorrowCapacity = useMemo(() => {
    if (userSupplyBorrow == null || borrowCapacity == null) return BigNumber(0);
    return formatUnits(
      userSupplyBorrow.borrowed ?? BigNumber(0),
      marketConfiguration?.baseTokenDecimals ?? 9
    ).plus(borrowCapacity);
  }, [userSupplyBorrow, borrowCapacity]);

  const {
    possibleBorrowCapacity,
    possibleCollateralValue,
    possibleLiquidationPoint,
    possibleAvailableToBorrow,
  } = usePossiblePositionSummary();

  const stats = [
    {
      title: 'Collateral Value',
      value: `$${collateralValue.toFixed(2)}`,
      changeValue: possibleCollateralValue
        ? `$${possibleCollateralValue.toFixed(2)}`
        : null,
    },
    {
      title: 'Liquidation Point',
      value: `$${liquidationPoint.toFixed(2)}` ?? BigNumber(0),
      changeValue: possibleLiquidationPoint
        ? `$${(possibleLiquidationPoint ?? BigNumber(0)).toFixed(2)}`
        : null,
    },
    {
      title: 'Borrow Capacity',
      value: `${(totalBorrowCapacity ?? BigNumber(0)).toFormat(2)} USDC`,
      changeValue: possibleBorrowCapacity
        ? `${possibleBorrowCapacity?.toFormat(2)} USDC`
        : null,
    },
    {
      title: 'Available to Borrow',
      value: `${(borrowCapacity ?? BigNumber(0)).toFormat(2)} USDC`,
      changeValue: possibleAvailableToBorrow
        ? `${possibleAvailableToBorrow?.toFixed(2)} USDC`
        : null,
    },
  ];

  return (
    <div>
      {/* {stats.map((stat) => {
        return (
          <div key={stat.title} className="flex gap-x-2">
            <div>{stat.title}</div>
            <div>{stat.value}</div>
            <div>{stat.changeValue}</div>
          </div>
        );
      })} */}
      <div className="text-neutral4 flex items-center gap-x-2">
        Position Summary <InfoIcon className="w-4 h-4" />
      </div>
    </div>
  );
};
