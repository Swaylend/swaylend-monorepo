import { MarketChart } from '@/components/MarketsView/MarketChart';
import MarketOverview from '@/components/MarketsView/MarketOverview';
import { useChartsData } from '@/hooks/useChartsData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MarketOverview',
};

export default async function Page({ params }: { params: { pair: string } }) {
  // TODO - use params to parse network and base asset from available combinations
  const [network, baseAsset] = params.pair.split('-');
  const chartData = await useChartsData();

  return (
    <MarketOverview
      network={network}
      baseAsset={baseAsset.toUpperCase()}
      marketChartCollateral={
        <MarketChart
          chartData={chartData?.[baseAsset]}
          dataKey="collateralValueUsd"
          color="#3FE8BD"
        />
      }
      marketChartBorrow={
        <MarketChart
          chartData={chartData?.[baseAsset]}
          dataKey="borrowedValueUsd"
          color="#8b5cf6"
        />
      }
    />
  );
}
