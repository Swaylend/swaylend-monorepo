import { MarketChart } from '@/components/MarketsView/MarketChart';
import MarketOverview from '@/components/MarketsView/MarketOverview';
import { NotFound } from '@/components/NotFound';
import { getChartData } from '@/lib/charts';
import { DEPLOYED_MARKETS } from '@/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MarketOverview',
};

export default async function Page({ params }: { params: { pair: string } }) {
  const [network, baseAsset] = params.pair.split('-');
  if (
    !network ||
    !baseAsset ||
    !Object.keys(DEPLOYED_MARKETS).includes(baseAsset.toUpperCase())
  ) {
    return <NotFound />;
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
          color="#8B5CF6"
        />
      }
    />
  );
}
