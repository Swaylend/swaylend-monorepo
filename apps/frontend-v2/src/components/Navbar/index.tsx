'use client';
import { cn } from '@/lib/utils';
import { ChartLine, Coins, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import Logo from '/public/icons/dark-logo.svg?url';
import { Line } from '../Line';
import { ConnectButton } from './ConnectButton';
import { MarketSwitcher } from './MarketSwitcher';
import { Points } from './Points';

const NAVBAR_LINKS = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/market', label: 'Market', icon: <ChartLine /> },
  { href: '/faucet', label: 'Faucet', icon: <Coins /> },
];

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <div>
      <div className="flex justify-between items-center px-16 min-h-[93px]">
        <Link href="https://swaylend.com">
          <Image src={Logo} alt="logo" />
        </Link>
        <div className="flex items-center gap-x-8 h-full">
          {NAVBAR_LINKS.map(({ href, label, icon }) => (
            <Link key={href} href={href}>
              <div
                className={cn(
                  pathname === href ? 'text-primary' : 'text-neutral2',
                  pathname === href ? '' : 'hover:text-neutral2/80',
                  'flex items-center gap-x-1 h-full relative'
                )}
              >
                {icon}
                {label}
                <div
                  className={cn(
                    pathname === href &&
                      '-z-10 absolute blur-2xl top-[19px] left-[calc(50%-20px)] w-16 h-10 bg-primary01'
                  )}
                />
              </div>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-x-2">
          <Points />
          <MarketSwitcher />
          <ConnectButton />
        </div>
      </div>
      <Line />
    </div>
  );
};
