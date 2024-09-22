import MarketOverview from '@/components/MarketsView/MarketOverview';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MarketOverview',
};

export default function Page({ params }: { params: { pair: string } }) {
  // TODO - use params to parse network and base asset from available combinations
  const [network, baseAsset] = params.pair.split('-');

  return (
    <MarketOverview network={network} baseAsset={baseAsset.toUpperCase()} />
  );
}
