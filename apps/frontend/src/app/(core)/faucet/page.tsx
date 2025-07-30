import type { Metadata } from 'next';
import { FaucetView } from '@/components/v1/faucet-view';
import { appConfig } from '@/configs';

export const metadata: Metadata = {
  title: 'Faucet',
};

export default function Page() {
  if (appConfig.env === 'testnet') {
    return <FaucetView />;
  }

  return (
    <div className="flex h-full items-center justify-center">
      Faucet is only available on testnet
    </div>
  );
}
