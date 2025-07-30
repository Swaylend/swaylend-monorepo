'use client';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  ChartLine,
  ChevronDown,
  Coins,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { appConfig } from '@/configs';
import { useTrackExternalPageView } from '@/lib/posthog';
import { cn } from '@/lib/utils';
import { MARKET_MODE, useMarketStore } from '@/stores/market-store';
import Logo from '/public/icons/dark-logo.svg?url';
import { Button } from '../ui/button';
import { Line } from '../v1/line';
import { ConnectButton } from './connect-button';
import { Points } from './points';

const NAVBAR_LINKS = [
  { href: '/markets', label: 'Markets', icon: <ChartLine /> },
  { href: '/portfolio', label: 'Portfolio', icon: <Coins /> },
  ...(appConfig.env === 'testnet'
    ? [{ href: '/faucet', label: 'Faucet', icon: <Coins /> }]
    : []),
];

export const Navbar = ({ mobile = false }: { mobile?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openDex, setOpenDex] = useState(false);
  const [openBridge, setOpenBridge] = useState(false);
  const marketMode = useMarketStore.use.marketMode();
  const changeMarketMode = useMarketStore.use.changeMarketMode();
  const { mutate: trackExternalPageView } = useTrackExternalPageView();

  return (
    <>
      <div className="w-full bg-purple px-4 py-1 text-center font-medium text-lavender text-md">
        New Functionality live! 🚀 Discover <b>Portfolio</b>: Track your
        markets, positions, and transactions now.
      </div>
      {/* DESKTOP */}
      <div className="max-lg:hidden">
        <div className="flex min-h-[93px] items-center justify-between px-16">
          <div className="flex items-center gap-x-[70px]">
            <Link href="/" prefetch={false}>
              <Image alt="logo" src={Logo} />
            </Link>
            <div className="flex h-full items-center gap-x-[25px]">
              <div>
                <button
                  className={cn(
                    pathname === '/' && marketMode === MARKET_MODE.BORROW
                      ? 'text-primary'
                      : 'text-lavender',
                    (pathname !== '/' || marketMode !== MARKET_MODE.BORROW) &&
                      'hover:text-lavender/80',
                    'flex min-h-[93px] cursor-pointer items-center justify-center font-semibold text-md'
                  )}
                  onClick={() => {
                    changeMarketMode(MARKET_MODE.BORROW);
                    router.push('/');
                  }}
                  type="button"
                >
                  Borrow
                </button>
              </div>
              <div>
                <button
                  className={cn(
                    pathname === '/' && marketMode === MARKET_MODE.LEND
                      ? 'text-primary'
                      : 'text-lavender',
                    (pathname !== '/' || marketMode !== MARKET_MODE.LEND) &&
                      'hover:text-lavender/80',
                    'flex min-h-[93px] cursor-pointer items-center justify-center font-semibold text-md'
                  )}
                  onClick={() => {
                    changeMarketMode(MARKET_MODE.LEND);
                    router.push('/');
                  }}
                  type="button"
                >
                  Earn
                </button>
              </div>
              {NAVBAR_LINKS.map(({ href, label }) => (
                <Link href={href} key={href} prefetch={false}>
                  <div
                    className={cn(
                      pathname === href ? 'text-primary' : 'text-lavender',
                      pathname !== href && 'hover:text-lavender/80',
                      'flex min-h-[93px] items-center justify-center font-semibold text-md'
                    )}
                  >
                    {label}
                  </div>
                </Link>
              ))}
              <DropdownMenu onOpenChange={setOpenBridge} open={openBridge}>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-x-1 border-none font-semibold text-lavender text-md outline-hidden hover:text-lavender/80 focus:border-none focus:outline-hidden">
                    Bridges
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem>
                    <div
                      className="w-full"
                      onMouseDown={() => {
                        trackExternalPageView(
                          `${appConfig.client.shared.fuelExplorerUrl}/bridge`
                        );
                        window.open(
                          `${appConfig.client.shared.fuelExplorerUrl}/bridge`,
                          '_blank'
                        );
                        setOpenBridge(false);
                      }}
                      rel="noreferrer"
                    >
                      <div className="flex w-full cursor-pointer items-center justify-between gap-x-2 px-0.5 py-1 font-medium text-lavender text-md hover:underline">
                        Official Fuel Bridge
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div
                      className="w-full"
                      onMouseDown={() => {
                        trackExternalPageView(
                          'https://www.orbiter.finance/?source=Ethereum&dest=Fuel&token=ETH'
                        );
                        window.open(
                          'https://www.orbiter.finance/?source=Ethereum&dest=Fuel&token=ETH',
                          '_blank'
                        );
                        setOpenBridge(false);
                      }}
                      rel="noreferrer"
                    >
                      <div className="flex w-full cursor-pointer items-center justify-between gap-x-2 px-0.5 py-1 font-medium text-lavender text-md hover:underline">
                        Orbiter Bridge
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Link href="/bridge" className="w-full">
                      <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2 cursor-pointer hover:underline">
                        Embedded
                      </div>
                    </Link>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu onOpenChange={setOpenDex} open={openDex}>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-x-1 border-none font-semibold text-lavender text-md outline-hidden hover:text-lavender/80 focus:border-none focus:outline-hidden">
                    Swap
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem>
                    <div
                      className="w-full"
                      onMouseDown={() => {
                        trackExternalPageView('https://mira.ly/');
                        window.open('https://mira.ly/', '_blank');
                        setOpenDex(false);
                      }}
                      rel="noreferrer"
                    >
                      <div className="flex w-full cursor-pointer items-center justify-between gap-x-2 px-0.5 py-1 font-medium text-lavender text-md hover:underline">
                        MIRA
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Link href="/swap" className="w-full">
                      <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2 cursor-pointer hover:underline">
                        Embedded
                      </div>
                    </Link>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Points />
            <ConnectButton />
          </div>
        </div>
        <Line />
      </div>

      {/* MOBILE */}
      <div className="hidden max-lg:block">
        <div className="flex h-[80px] items-center justify-between px-4">
          <Link href="/" prefetch={false}>
            <Image alt="logo" src={Logo} />
          </Link>
          <div className="flex items-center gap-x-2">
            <Points />
            <ConnectButton />
            <Button
              className="h-[40px] w-[40px] rounded-full p-0"
              onMouseDown={() => setOpen(true)}
              variant="secondary"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Line />
        <Drawer onOpenChange={setOpen} open={open}>
          <DrawerContent className="h-dvh">
            <VisuallyHidden.Root>
              <DrawerHeader>
                <DrawerTitle>Hamburger Menu</DrawerTitle>
              </DrawerHeader>
            </VisuallyHidden.Root>
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="flex h-[80px] w-full items-center justify-between px-8">
                <a href="https://swaylend.com" rel="noreferrer" target="_blank">
                  <Image alt="logo" src={Logo} />
                </a>
                <Button
                  className="h-[40px] w-[40px] rounded-full p-0"
                  onMouseDown={() => setOpen(false)}
                  variant="secondary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-8 flex h-full w-full flex-col items-start justify-between px-8 py-16">
                <div className="flex h-full w-full flex-col items-start gap-y-8 pt-16">
                  <Link
                    href="/"
                    onMouseDown={() => setOpen(false)}
                    prefetch={false}
                  >
                    <div
                      className={cn(
                        pathname === '/' ? 'text-primary' : 'text-lavender',
                        pathname !== '/' && 'hover:text-lavender/80',
                        'flex h-full items-center gap-x-2 font-bold text-xl'
                      )}
                    >
                      Dashboard
                    </div>
                  </Link>
                  <Link
                    href="/swap"
                    onMouseDown={() => setOpen(false)}
                    prefetch={false}
                  >
                    <div
                      className={cn(
                        pathname === '/swap' ? 'text-primary' : 'text-lavender',
                        pathname !== '/swap' && 'hover:text-lavender/80',
                        'flex h-full items-center gap-x-2 font-bold text-xl'
                      )}
                    >
                      Swap
                    </div>
                  </Link>
                  {NAVBAR_LINKS.map(({ href, label }) => {
                    if (mobile && href === '/markets') return null;
                    return (
                      <Link
                        href={href}
                        key={href}
                        onMouseDown={() => setOpen(false)}
                        prefetch={false}
                      >
                        <div
                          className={cn(
                            pathname === href
                              ? 'text-primary'
                              : 'text-lavender',
                            pathname !== href && 'hover:text-lavender/80',
                            'flex h-full items-center gap-x-2 font-bold text-xl'
                          )}
                        >
                          {label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
