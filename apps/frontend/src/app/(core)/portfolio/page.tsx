import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { isMobile } from '@/utils/is-mobile';
import { ClientView } from './client';

export const metadata: Metadata = {
  title: 'Portfolio',
};

export const revalidate = 300;

export default async function Page() {
  const userAgent = (await headers()).get('user-agent') || '';
  const mobile = isMobile(userAgent);

  if (mobile) {
    return (
      <div className="flex h-[60dvh] w-full items-center justify-center">
        This page is not available on mobile devices.
      </div>
    );
  }

  return (
    <div className="max-h-full overflow-auto">
      <div className="flex w-full flex-col items-center justify-center px-[88px] pt-[60px] pb-[55px] max-lg:hidden">
        <ClientView />
      </div>
      <div className="flex h-[60dvh] w-full items-center justify-center lg:hidden">
        This page is not supported on this screen size.
      </div>
    </div>
  );
}
