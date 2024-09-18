import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { TermsAndConditions } from '@/components/TermsAndConditionsDialog';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="h-screen flex flex-col min-h-[calc(100dvh)]">
        <Navbar />
        <div className="bg-background flex-1">{children}</div>
        <Footer />
        <TermsAndConditions />
      </div>
    </Providers>
  );
}
