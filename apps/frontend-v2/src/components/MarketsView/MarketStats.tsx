import type { ChartData } from '@/hooks/useChartsData';
import React from 'react';
import { Skeleton } from '../ui/skeleton';
import BigNumber from 'bignumber.js';
import { getFormattedPrice } from '@/utils';

export const MarketStats = ({
  chartData,
}: {
  chartData: ChartData[] | undefined;
}) => {
  if (!chartData) return;
  <Skeleton className="w-full h-[30px]" />;

  const borrowed = BigNumber(chartData[chartData.length - 1].borrowedValueUsd);
  const supplied = BigNumber(chartData[chartData.length - 1].suppliedValueUsd);
  const collateral = BigNumber(
    chartData[chartData.length - 1].collateralValueUsd
  );

  return (
    <div className="max-lg:hidden flex w-full justify-between">
      <div>
        <div className="text-moon text-sm font-semibold">Total Supply</div>
        <div className="text-white font-bold text-2xl">
          {getFormattedPrice(collateral.plus(supplied))}
        </div>
      </div>
      <div className="flex gap-x-16">
        <div>
          <div className="flex gap-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className=" text-sm font-semibold text-primary">Earning</div>
          </div>
          <div className="text-white font-bold text-xl">
            {getFormattedPrice(supplied)}
          </div>
        </div>
        <div>
          <div className="flex gap-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-purple" />
            <div className=" text-sm font-semibold text-purple">Borrowing </div>
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
