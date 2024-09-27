import { MarketsTable } from '@/components/MarketsView/MarketsTable';
import { MarketStats } from '@/components/MarketsView/MarketStats';
import { MultiMarketChart } from '@/components/MarketsView/MultiMarketChart';
import { Market } from '@/contract-types';
import { type ChartData, useChartsData } from '@/hooks/useChartsData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market',
};

export default async function Page() {
  //const chartsData = await useChartsData();
  const chartsData: { merged: ChartData[] } = { merged: [] };
  chartsData.merged.push({
    timestamp: 1727273262,
    borrowedValueUsd: 123123,
    suppliedValueUsd: 123123123,
    collateralValueUsd: 12312312,
  } as ChartData);
  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <MarketStats chartData={chartsData?.merged} />

      <div className="w-full h-[320px] mt-12 mb-[55px]">
        <MultiMarketChart chartData={chartsData?.merged} />
      </div>
      <MarketsTable />
    </div>
  );
}
