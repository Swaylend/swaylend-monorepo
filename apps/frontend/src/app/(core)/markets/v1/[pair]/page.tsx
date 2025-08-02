import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import MarketOverview from '@/components/v1/markets-view/market-overview';
import { appConfig } from '@/configs';
import { getChartData } from '@/lib/charts/v1';
import { isMobile } from '@/utils/is-mobile';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const [network, baseAsset] = pair.split('-');

  if (
    !(
      network &&
      baseAsset &&
      Object.keys(appConfig.client.v1.markets).includes(baseAsset.toUpperCase())
    )
  ) {
    return {
      title: 'Markets',
    };
  }

  return {
    title: `${network.toUpperCase()}-${baseAsset.toUpperCase()} Market`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const userAgent = (await headers()).get('user-agent') || '';
  const mobile = isMobile(userAgent);

  if (mobile) {
    return (
      <div className="flex h-[60dvh] w-full items-center justify-center">
        This page is not available on mobile devices.
      </div>
    );
  }

  const { pair } = await params;
  const [network, baseAsset] = pair.split('-');

  if (
    !(
      network &&
      baseAsset &&
      Object.keys(appConfig.client.v1.markets).includes(baseAsset.toUpperCase())
    )
  ) {
    notFound();
  }
  const chartData = await getChartData();

  return (
    <>
      <MarketOverview
        baseAsset={baseAsset.toUpperCase()}
        chartData={chartData?.singleMarketData[baseAsset]}
        network={network}
      />
      <div className="flex h-[60dvh] w-full items-center justify-center lg:hidden">
        This page is not supported on this screen size.
      </div>
    </>
  );
}
