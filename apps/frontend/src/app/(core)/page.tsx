import { DashboardView } from '@/components/DashboardView';
import { isMobile } from '@/utils/isMobile';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: { absolute: 'Swaylend | Lending reimagined' },
};

export default function Home() {
  const userAgent = headers().get('user-agent') || '';
  const mobile = isMobile(userAgent);
  return (
    <div className="max-h-full">
      {mobile ? (
        <div className="w-full h-[60dvh] flex items-center justify-center">
          This page is not available on mobile devices.
        </div>
      ) : (
        <DashboardView />
      )}
    </div>
  );
}
