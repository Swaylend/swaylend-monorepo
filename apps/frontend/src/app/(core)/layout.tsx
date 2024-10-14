import { Footer } from '@/components/Footer';
import { IntroductionDialog } from '@/components/IntroductionDialog';
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';
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
        <IntroductionDialog />
      </div>
    </Providers>
  );
}
