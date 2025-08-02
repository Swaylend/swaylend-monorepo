import BigNumber from 'bignumber.js';
import type { ChartData } from '@/lib/charts/v1';
import { getFormattedPrice } from '@/utils';
import { Skeleton } from '../../ui/skeleton';

export const MarketStats = ({
  chartData,
}: {
  chartData: ChartData[] | undefined;
}) => {
  if (!chartData) {
    return <Skeleton className="h-[30px] w-full" />;
  }

  const borrowed =
    chartData.length > 0
      ? BigNumber(chartData.at(-1)?.borrowedValueUsd ?? 0)
      : BigNumber(0);
  const supplied =
    chartData.length > 0
      ? BigNumber(chartData.at(-1)?.suppliedValueUsd ?? 0)
      : BigNumber(0);
  const collateral =
    chartData.length > 0
      ? BigNumber(chartData.at(-1)?.collateralValueUsd ?? 0)
      : BigNumber(0);

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col justify-end">
        <div className="font-semibold text-moon text-sm">Total Supply</div>
        <div className="font-bold text-2xl text-white">
          {getFormattedPrice(collateral.plus(supplied))}
        </div>
      </div>
      <div className="flex items-end gap-x-16">
        <div>
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="font-semibold text-primary text-sm">Earning</div>
          </div>
          <div className="font-bold text-white text-xl">
            {getFormattedPrice(supplied)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-purple" />
            <div className="font-semibold text-purple text-sm">Borrowing </div>
          </div>
          <div className="font-bold text-white text-xl">
            {getFormattedPrice(borrowed)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-[#918E8E]" />
            <div className="font-semibold text-moon text-sm">Collateral</div>
          </div>
          <div className="font-bold text-white text-xl">
            {getFormattedPrice(collateral)}
          </div>
        </div>
      </div>
    </div>
  );
};
