import { FaucetView } from '@/components/FaucetView';
import { appConfig } from '@/configs';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Faucet',
};

export default function Page() {
  if (appConfig.env === 'testnet') {
    return <FaucetView />;
  }

  return (
    <div className="h-full flex justify-center items-center">
      Faucet is only available on testnet
    </div>
  );
}
