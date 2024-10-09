import { MarketStats } from '@/components/MarketsView/MarketStats';
import { MarketsTable } from '@/components/MarketsView/MarketsTable';
import { MultiMarketChart } from '@/components/MarketsView/MultiMarketChart';
import { getChartData } from '@/lib/charts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markets',
};

export const revalidate = 600;

export default async function Page() {
  const chartsData = await getChartData();

  return (
    <div className="max-h-full overflow-auto">
      <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
        <MarketStats chartData={chartsData?.marketsCombinedData} />
        <div className="w-full h-[320px] mt-[80px] mb-[55px]">
          <MultiMarketChart chartData={chartsData?.marketsCombinedData} />
        </div>
        <MarketsTable />
      </div>
      <div className="lg:hidden text-center w-full text-primary absolute mt-[-400px]">
        This page is not available on mobile devices.
      </div>
    </div>
  );
}
