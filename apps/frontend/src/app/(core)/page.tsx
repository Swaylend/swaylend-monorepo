import { DashboardView } from '@/components/DashboardView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Swaylend' },
};

export default function Home() {
  return <DashboardView />;
}
