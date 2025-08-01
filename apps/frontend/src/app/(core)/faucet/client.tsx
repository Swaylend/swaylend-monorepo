'use client';

import { FaucetView as FaucetViewV1 } from '@/components/v1/faucet-view';
import { FaucetView as FaucetViewV2 } from '@/components/v2/faucet-view';
import { useVersionStore } from '@/stores/version-store';

export const ClientView = () => {
  const version = useVersionStore.use.version();
  return version === 'v1' ? <FaucetViewV1 /> : <FaucetViewV2 />;
};
