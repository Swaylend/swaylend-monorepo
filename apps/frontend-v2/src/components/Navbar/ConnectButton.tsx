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
        {isConnected
          ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
          : isConnecting
            ? 'Connecting'
            : 'Connect'}
      </Button>
    </>
  );
};
