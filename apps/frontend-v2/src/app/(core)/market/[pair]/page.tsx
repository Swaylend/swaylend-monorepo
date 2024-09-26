import { MarketChart } from '@/components/MarketsView/MarketChart';
import MarketOverview from '@/components/MarketsView/MarketOverview';
import { getChartData } from '@/lib/charts';
import { DEPLOYED_MARKETS } from '@/utils';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'MarketOverview',
};

export default async function Page({ params }: { params: { pair: string } }) {
  // TODO - use params to parse network and base asset from available combinations
  const [network, baseAsset] = params.pair.split('-');
  if (
    !network ||
    !baseAsset ||
    !Object.keys(DEPLOYED_MARKETS).includes(baseAsset.toUpperCase())
  ) {
    redirect('/');
  }
  const chartData = await getChartData();

  return (
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
          color="#8b5cf6"
        />
      }
    />
  );
}
