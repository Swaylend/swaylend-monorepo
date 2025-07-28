import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';
import { AnnouncementPopover } from '@/components/v1/announcement-popover';
import { IntroductionDialog } from '@/components/v1/introduction-dialog';
import { appConfig } from '@/configs';
import { isMobile } from '@/utils/is-mobile';
import { headers } from 'next/headers';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userAgent = headers().get('user-agent') || '';
  const mobile = isMobile(userAgent);
  return (
    <Providers>
      <div className="h-screen flex flex-col min-h-dvh">
        <Navbar mobile={mobile} />
        <div className="bg-background flex-1">{children}</div>
        <Footer />
        {!mobile && appConfig.client.announcementEnabled && (
          <AnnouncementPopover />
        )}
        <IntroductionDialog />
      </div>
    </Providers>
  );
}
