import { DashboardView } from '@/components/DashboardView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Swaylend | Lending reimagined' },
};

export default function Home() {
  return (
    <div className="max-h-full">
      <div className="hidden md:block">
        <DashboardView />
      </div>
      <div className="md:hidden w-full h-screen flex items-center justify-center">
        This page is not available on mobile devices.
      </div>
    </div>
  );
}
