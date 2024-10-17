import { MarketStats } from '@/components/MarketsView/MarketStats';
import { MarketsTable } from '@/components/MarketsView/MarketsTable';
import { MultiMarketChart } from '@/components/MarketsView/MultiMarketChart';
import { getChartData } from '@/lib/charts';
import { isMobile } from '@/utils/isMobile';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Markets',
};

export const revalidate = 300;

export default async function Page() {
  const userAgent = headers().get('user-agent') || '';
  const mobile = isMobile(userAgent);

  if (mobile) {
    return (
      <div className="w-full h-[60dvh] flex items-center justify-center">
        This page is not available on mobile devices.
      </div>
    );
  }

  const chartsData = await getChartData();

  return (
    <div className="max-h-full overflow-auto">
      <div className="max-lg:hidden pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
        <MarketStats chartData={chartsData?.marketsCombinedData} />
        <div className="w-full h-[320px] mt-[80px] mb-[55px]">
          <MultiMarketChart chartData={chartsData?.marketsCombinedData} />
        </div>
        <MarketsTable />
      </div>
      <div className="lg:hidden w-full h-[60dvh] flex items-center justify-center">
        This page is not supported on this screen size.
      </div>
    </div>
  );
}
