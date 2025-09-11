import type { Metadata } from 'next';
import { appConfig } from '@/configs';
import { ClientView } from './client';

export const metadata: Metadata = {
  title: 'Faucet',
};

export default function Page() {
  if (appConfig.env === 'testnet') {
    return <ClientView />;
  }

  return (
    <div className="flex h-full items-center justify-center">
      Faucet is only available on testnet
    </div>
  );
}
