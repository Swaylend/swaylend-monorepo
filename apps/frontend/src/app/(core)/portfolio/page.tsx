import { PortfolioView } from '@/components/PortfolioView';
import { isMobile } from '@/utils/isMobile';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Portfolio',
};

export const revalidate = 300;

export default async function Page() {
  const userAgent = headers().get('user-agent') || '';
  const mobile = isMobile(userAgent);

  if (mobile) {
    return (
      <div className="w-full h-[60dvh] flex items-center justify-center">
        This page is not available on mobile devices.
      </div>
    );
  }

  return (
    <div className="max-h-full overflow-auto">
      <div className="max-lg:hidden pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
        <PortfolioView />
      </div>
      <div className="lg:hidden w-full h-[60dvh] flex items-center justify-center">
        This page is not supported on this screen size.
      </div>
    </div>
  );
}
