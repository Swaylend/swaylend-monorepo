import { DashboardView } from '@/components/v1/DashboardView';
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
