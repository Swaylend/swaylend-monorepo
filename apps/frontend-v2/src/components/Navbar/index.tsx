import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { ConnectButton } from './ConnectButton';
import Logo from '/public/icons/dark-logo.svg?url';

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
        <ConnectButton />
      </div>
    </div>
  );
};
