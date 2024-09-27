import { MarketsTable } from '@/components/MarketsView/MarketsTable';
import { MarketStats } from '@/components/MarketsView/MarketStats';
import { MultiMarketChart } from '@/components/MarketsView/MultiMarketChart';
import { getChartData } from '@/lib/charts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market',
};

export default async function Page() {
  const chartsData = await getChartData();

  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <MarketStats chartData={chartsData?.marketsCombinedData} />

      <div className="w-full h-[320px] mt-12 mb-[55px]">
        <MultiMarketChart chartData={chartsData?.marketsCombinedData} />
      </div>
      <MarketsTable />
    </div>
  );
}
