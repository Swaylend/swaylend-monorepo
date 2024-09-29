import { MarketChart } from '@/components/MarketsView/MarketChart';
import MarketOverview from '@/components/MarketsView/MarketOverview';
import { appConfig } from '@/configs';
import { getChartData } from '@/lib/charts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'MarketOverview',
};

export default async function Page({ params }: { params: { pair: string } }) {
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
            color="#3FE8BD"
          />
        }
        marketChartBorrow={
          <MarketChart
            chartData={chartData?.singleMarketData[baseAsset]}
            dataKey="borrowedValueUsd"
            color="#8B5CF6"
          />
        }
      />
      <div className="lg:hidden text-center w-full flex justify-center items-center text-primary">
        This page is not available on mobile devices.
      </div>
    </>
  );
}
