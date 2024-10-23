import { AnnouncementPopover } from '@/components/AnnouncementPopover';
import { Footer } from '@/components/Footer';
import { IntroductionDialog } from '@/components/IntroductionDialog';
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { appConfig } from '@/configs';
import { isMobile } from '@/utils/isMobile';
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
