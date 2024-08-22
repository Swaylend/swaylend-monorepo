'use client';

import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useIsConnected,
} from '@fuels/react';
import { Button } from '../ui/button';

export const ConnectButton = () => {
  const { connect, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  return (
    <>
      <Button
        variant={isConnected ? 'default' : 'ghost'}
        disabled={isConnecting}
        onMouseDown={() => {
          if (!isConnected) return connect();
          disconnect();
        }}
      >
        {isConnected ? account : isConnecting ? 'Connecting' : 'Connect'}
      </Button>
    </>
  );
};
