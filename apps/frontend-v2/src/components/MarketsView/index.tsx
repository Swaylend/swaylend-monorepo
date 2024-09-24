'use client';
import { type ChartData, useChartsData } from '@/hooks/useChartsData';
import React, { useMemo } from 'react';
import { MarketsTable } from './MarketsTable';
import { MultiMarketChart } from './MultiMarketChart';

export const MarketsView = () => {
  const { data: chartData } = useChartsData();

  const chartData1 = useMemo(() => {
    const usdcChartData = chartData?.USDC.sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const usdtChartData = chartData?.USDT.sort(
      (a, b) => a.timestamp - b.timestamp
    );
    if (!usdcChartData || !usdtChartData) return [];
    const mergedData: ChartData[] = [];

    usdcChartData.forEach((usdcRow) => {
      const usdtRow = usdtChartData.find(
        (row) => row.timestamp === usdcRow.timestamp
      );

      if (usdtRow) {
        mergedData.push({
          timestamp: usdcRow.timestamp,
          suppliedValueUsd:
            Number(usdcRow.suppliedValueUsd) + Number(usdtRow.suppliedValueUsd),
          borrowedValueUsd:
            Number(usdcRow.borrowedValueUsd) + Number(usdtRow.borrowedValueUsd),
          collateralValueUsd:
            Number(usdcRow.collateralValueUsd) +
            Number(usdtRow.collateralValueUsd),
        });
      } else {
        mergedData.push({
          timestamp: usdcRow.timestamp,
          suppliedValueUsd: Number(usdcRow.suppliedValueUsd),
          borrowedValueUsd: Number(usdcRow.borrowedValueUsd),
          collateralValueUsd: Number(usdcRow.collateralValueUsd),
        });
      }
    });

    return mergedData.sort((a, b) => a.timestamp - b.timestamp);
  }, []);

  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <div className="w-full flex justify-center items-center gap-x-4">
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="text-white text-md font-normal">Earning</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-purple" />
          <div className="text-white text-md font-normal">Borrowing</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
          <div className="text-white text-md font-normal">Collateral</div>
        </div>
      </div>
      <div className="w-full h-[320px] mt-12 mb-[125px]">
        <MultiMarketChart chartData={chartData1} />
      </div>
      <MarketsTable />
    </div>
  );
};
