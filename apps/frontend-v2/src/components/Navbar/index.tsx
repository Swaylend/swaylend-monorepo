'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  ChevronDown,
  Coins,
  ExternalLink,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Logo from '/public/icons/dark-logo.svg?url';
import LogoIcon from '/public/icons/sway-icon-logo.svg?url';
import { Line } from '../Line';
import { Button } from '../ui/button';
import { ConnectButton } from './ConnectButton';
import { MarketSwitcher } from './MarketSwitcher';
import { Points } from './Points';

const NAVBAR_LINKS = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard /> },
  // { href: '/market', label: 'Market', icon: <ChartLine /> },
  { href: '/faucet', label: 'Faucet', icon: <Coins /> },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* DESKTOP */}
      <div className="max-lg:hidden">
        <div className="flex justify-between items-center px-16 min-h-[93px]">
          <Link href="/">
            <Image src={Logo} alt="logo" />
          </Link>
          <div className="flex items-center gap-x-8 h-full">
            {NAVBAR_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    pathname === href ? 'text-primary' : 'text-lavender',
                    pathname !== href && 'hover:text-lavender/80',
                    'flex items-center w-[80px] justify-center text-md font-semibold gap-x-1 h-full relative'
                  )}
                >
                  {label}
                  <div
                    className={cn(
                      pathname === href &&
                        '-z-10 absolute blur-[30px] top-[35px] left-[calc(50%-30px)] w-16 h-10 bg-primary'
                    )}
                  />
                </div>
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="text-lavender outline-none border-none focus:outline-none focus:border-none hover:text-lavender/80 text-md font-semibold flex items-center gap-x-1">
                  Bridges
                  <ChevronDown className="w-4 h-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <a
                    href="https://app.uniswap.io"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2">
                      Bridge 1
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a
                    href="https://app.uniswap.io"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2">
                      Bridge 2
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="text-lavender outline-none border-none focus:outline-none focus:border-none hover:text-lavender/80 text-md font-semibold flex items-center gap-x-1">
                  DEX
                  <ChevronDown className="w-4 h-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <a
                    href="https://app.uniswap.io"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2">
                      DEX 1
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a
                    href="https://app.uniswap.io"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2">
                      DEX 2
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-x-2">
            <Points />
            <MarketSwitcher />
            <ConnectButton />
          </div>
        </div>
        <Line />
      </div>

      {/* MOBILE */}
      <div className="hidden max-lg:block">
        <div className="flex justify-between items-center px-4 h-[80px]">
          <Link href="/">
            <Image src={LogoIcon} alt="logo" />
          </Link>
          <div className="flex items-center gap-x-2">
            <Points />
            <div className="hidden md:block">
              <MarketSwitcher />
            </div>
            <ConnectButton />
            <Button
              onMouseDown={() => setOpen(true)}
              className="rounded-full w-[40px] h-[40px] p-0"
              variant="secondary"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <Line />
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="h-screen">
            <VisuallyHidden.Root>
              <DrawerHeader>
                <DrawerTitle>Hamburger Menu</DrawerTitle>
              </DrawerHeader>
            </VisuallyHidden.Root>
            <div className="flex flex-col items-center w-full h-full justify-center">
              <div className="flex justify-between w-full items-center px-4 h-[80px]">
                <a href="https://swaylend.com" target="_blank" rel="noreferrer">
                  <Image src={LogoIcon} alt="logo" />
                </a>
                <Button
                  onMouseDown={() => setOpen(false)}
                  className="rounded-full w-[40px] h-[40px] p-0"
                  variant="secondary"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="h-full flex flex-col justify-between items-start px-8 w-full py-16 mt-8">
                <div className="flex flex-col w-full h-full items-start gap-y-8  pt-16">
                  {NAVBAR_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onMouseDown={() => setOpen(false)}
                    >
                      <div
                        className={cn(
                          pathname === href ? 'text-primary' : 'text-lavender',
                          pathname !== href && 'hover:text-lavender/80',
                          'flex font-bold text-xl items-center gap-x-2 h-full relative'
                        )}
                      >
                        {label}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="md:hidden flex-col flex gap-y-2 w-[160px] mt-16">
                  <div className="pl-4">Market</div>
                  <MarketSwitcher />
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
