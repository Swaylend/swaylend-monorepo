import { headers } from 'next/headers';
import { Footer } from '@/components/footer';
import { IntroductionDialog } from '@/components/introduction-dialog';
import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';
import { AnnouncementPopover } from '@/components/v1/announcement-popover';
import { appConfig } from '@/configs';
import { isMobile } from '@/utils/is-mobile';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userAgent = (await headers()).get('user-agent') || '';
  const mobile = isMobile(userAgent);
  return (
    <Providers>
      <div className="flex h-screen min-h-dvh flex-col">
        <Navbar mobile={mobile} />
        <div className="flex-1 bg-background">{children}</div>
        <Footer />
        {!mobile && appConfig.client.v1.announcementEnabled && (
          <AnnouncementPopover />
        )}
        <IntroductionDialog />
      </div>
    </Providers>
  );
}
