import { FaucetView } from '@/components/FaucetView';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Faucet',
};

export default function Page() {
  return <FaucetView />;
}
