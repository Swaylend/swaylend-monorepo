import { DashboardView } from '@/components/v1/dashboard-view';
import type { Metadata } from 'next';

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
