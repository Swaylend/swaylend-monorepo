import './globals.css';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Swaylend | Lending reimagined',
    template: 'Swaylend | %s',
  },
  description: "Welcome to Fuel's first lending protocol.",
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  openGraph: {
    description: "Welcome to Fuel's first lending protocol.",
    siteName: 'app.swaylend.com',
    title: 'app.swaylend.com - Swaylend',
    type: 'article',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'app.swaylend.com - Swaylend',
    description: "Welcome to Fuel's first lending protocol.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
