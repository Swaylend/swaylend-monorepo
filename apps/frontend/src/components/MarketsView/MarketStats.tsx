import type { ChartData } from '@/lib/charts';
import { getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const MarketStats = ({
  chartData,
}: {
  chartData: ChartData[] | undefined;
}) => {
  if (!chartData) {
    return <Skeleton className="w-full h-[30px]" />;
  }

  const borrowed =
    chartData.length > 0
      ? BigNumber(chartData[chartData.length - 1].borrowedValueUsd)
      : BigNumber(0);
  const supplied =
    chartData.length > 0
      ? BigNumber(chartData[chartData.length - 1].suppliedValueUsd)
      : BigNumber(0);
  const collateral =
    chartData.length > 0
      ? BigNumber(chartData[chartData.length - 1].collateralValueUsd)
      : BigNumber(0);

  return (
    <div className="max-lg:hidden flex w-full justify-between">
      <div className="flex flex-col justify-end">
        <div className="text-moon text-sm font-semibold">Total Supply</div>
        <div className="text-white font-bold text-2xl">
          {getFormattedPrice(collateral.plus(supplied))}
        </div>
      </div>
      <div className="flex items-end gap-x-16">
        <div>
          <div className="flex gap-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="text-sm font-semibold text-primary">Earning</div>
          </div>
          <div className="text-white font-bold text-xl">
            {getFormattedPrice(supplied)}
          </div>
        </div>
        <div>
          <div className="flex gap-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-purple" />
            <div className="text-sm font-semibold text-purple">Borrowing </div>
          </div>
          <div className="text-white font-bold text-xl">
            {getFormattedPrice(borrowed)}
          </div>
        </div>
        <div>
          <div className="flex gap-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
            <div className="text-moon text-sm font-semibold">Collateral</div>
          </div>
          <div className="text-white font-bold text-xl">
            {getFormattedPrice(collateral)}
          </div>
        </div>
      </div>
    </div>
  );
};
