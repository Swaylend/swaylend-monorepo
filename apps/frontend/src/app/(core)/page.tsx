import { DashboardView } from '@/components/DashboardView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SwayLend',
};

export default function Home() {
  return <DashboardView />;
}
