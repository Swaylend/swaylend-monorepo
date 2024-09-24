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
      chartsData={chartData}
    />
  );
}
