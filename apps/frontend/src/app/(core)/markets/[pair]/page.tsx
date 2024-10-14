import { MarketChart } from '@/components/MarketsView/MarketChart';
import MarketOverview from '@/components/MarketsView/MarketOverview';
import { appConfig } from '@/configs';
import { getChartData } from '@/lib/charts';
import { isMobile } from '@/utils/isMobile';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: { pair: string } }) {
  const [network, baseAsset] = params.pair.split('-');

  if (
    !network ||
    !baseAsset ||
    !Object.keys(appConfig.markets).includes(baseAsset.toUpperCase())
  ) {
    return {
      title: 'Markets',
    };
  }

  return {
    title: `${network.toUpperCase()}-${baseAsset.toUpperCase()} Market`,
  };
}

export default async function Page({ params }: { params: { pair: string } }) {
  const userAgent = headers().get('user-agent') || '';
  const mobile = isMobile(userAgent);

  if (mobile)
    return (
      <div className="w-full h-[60dvh] flex items-center justify-center">
        This page is not available on mobile devices.
      </div>
    );

  const [network, baseAsset] = params.pair.split('-');
  if (
    !network ||
    !baseAsset ||
    !Object.keys(appConfig.markets).includes(baseAsset.toUpperCase())
  ) {
    notFound();
  }
  const chartData = await getChartData();

  return (
    <>
      <MarketOverview
        network={network}
        baseAsset={baseAsset.toUpperCase()}
        marketChartCollateral={
          <MarketChart
            chartData={chartData?.singleMarketData[baseAsset]}
            dataKey="collateralValueUsd"
            color="#8B5CF6"
          />
        }
        marketChartBorrow={
          <MarketChart
            chartData={chartData?.singleMarketData[baseAsset]}
            dataKey="borrowedValueUsd"
            color="#3FE8BD"
          />
        }
      />
      <div className="lg:hidden w-full h-[60dvh] flex items-center justify-center">
        Minimum supported witdh reached
      </div>
    </>
  );
}
