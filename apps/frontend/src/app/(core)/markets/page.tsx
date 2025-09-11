import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { MarketStats } from '@/components/v2/markets-view/market-stats';
import { MarketsTable } from '@/components/v2/markets-view/markets-table';
import { MultiMarketChart } from '@/components/v2/markets-view/multi-market-chart';
import { getChartData } from '@/lib/charts/v2';
import { isMobile } from '@/utils/is-mobile';

export const metadata: Metadata = {
  title: 'Markets',
};

export default async function Page() {
  const userAgent = (await headers()).get('user-agent') || '';
  const mobile = isMobile(userAgent);

  if (mobile) {
    return (
      <div className="flex h-[60dvh] w-full items-center justify-center">
        This page is not available on mobile devices.
      </div>
    );
  }

  const chartsData = await getChartData();

  return (
    <div className="max-h-full overflow-auto">
      <div className="w-full px-[88px] pt-[30px] underline">
        <Link href="/markets/v1">View V1 Markets</Link>
      </div>
      <div className="flex w-full flex-col items-center justify-center px-[88px] pt-[30px] pb-[55px] max-lg:hidden">
        <MarketStats chartData={chartsData?.marketsCombinedData} />
        <div className="mt-[80px] mb-[55px] w-full">
          <MultiMarketChart chartData={chartsData?.marketsCombinedData} />
        </div>
        <div className="h-full w-full">
          <MarketsTable />
        </div>
      </div>
      <div className="flex h-[60dvh] w-full items-center justify-center lg:hidden">
        This page is not supported on this screen size.
      </div>
    </div>
  );
}
