import { MarketsView } from '@/components/MarketsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market',
};

export default function Page() {
  return <MarketsView />;
}
