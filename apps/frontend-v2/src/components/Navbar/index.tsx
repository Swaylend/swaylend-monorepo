'use client';
import { Button } from '@/components/ui/button';
import {
  useAccount,
  useAccounts,
  useConnectUI,
  useDisconnect,
  useFuel,
  useIsConnected,
  useWallet,
} from '@fuels/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Logo from '/public/icons/dark-logo.svg?url';

export const Navbar = () => {
  const { connect, error, isError, theme, isConnecting } = useConnectUI();
  const { fuel } = useFuel();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { accounts } = useAccounts();
  return (
    <div className="flex justify-between">
      <Link href="https://swaylend.com">
        <Image src={Logo} alt="logo" />
      </Link>

      <div>
        <Link href="/"> Dashboard </Link>
        <Link href="/faucet"> Faucet </Link>
        <Link href="/market"> Market </Link>
      </div>
      <div className="Actions">
        {!isConnected && (
          <Button
            variant="default"
            onClick={() => {
              console.log('connect');
              connect();
            }}
          >
            {isConnecting ? 'Connecting' : 'Connect'}
          </Button>
        )}
        {isConnected && (
          <Button variant="ghost" onClick={() => disconnect()}>
            {account}
          </Button>
        )}
      </div>
    </div>
  );
};
