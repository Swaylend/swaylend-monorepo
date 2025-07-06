import { DashboardView } from '@/components/DashboardView';
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
