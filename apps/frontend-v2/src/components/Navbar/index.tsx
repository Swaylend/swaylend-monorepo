import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Logo from '/public/icons/dark-logo.svg?url';
import { ConnectButton } from './ConnectButton';
import { MarketSwitcher } from './MarketSwitcher';

export const Navbar = () => {
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
      <div>
        <MarketSwitcher />
        <ConnectButton />
      </div>
    </div>
  );
};
