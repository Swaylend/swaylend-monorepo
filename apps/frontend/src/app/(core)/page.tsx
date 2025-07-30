import type { Metadata } from 'next';
import { DashboardView } from '@/components/v1/dashboard-view';

export const metadata: Metadata = {
  title: { absolute: 'Swaylend | Lending reimagined' },
};

export default function Home() {
  return (
    <div className="max-h-full">
      <DashboardView />
    </div>
  );
}
