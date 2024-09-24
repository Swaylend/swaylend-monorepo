import { MarketsView } from '@/components/MarketsView';
import { useChartsData } from '@/hooks/useChartsData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market',
};

export default async function Page() {
  const chartData = await useChartsData();

  return <MarketsView chartsData={chartData} />;
}
