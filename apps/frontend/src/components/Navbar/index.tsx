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
import { appConfig } from '@/configs';
import { useTrackExternalPageView } from '@/lib/posthog';
import { cn } from '@/lib/utils';
import {
  MARKET_MODE,
  selectChangeMarketMode,
  selectMarketMode,
  useMarketStore,
} from '@/stores';
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
import Logo from '/public/icons/dark-logo.svg?url';
import { Line } from '../Line';
import { Button } from '../ui/button';
import { ConnectButton } from './ConnectButton';
import { Points } from './Points';

const NAVBAR_LINKS = [
  { href: '/markets', label: 'Markets', icon: <ChartLine /> },
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
  const marketMode = useMarketStore(selectMarketMode);
  const changeMarketMode = useMarketStore(selectChangeMarketMode);
  const { mutate: trackExternalPageView } = useTrackExternalPageView();

  return (
    <>
      <div className="w-full text-center bg-purple font-medium text-md text-lavender py-2 px-4">
        SwayPoints are live! Start earning points now.
        <a
          href="https://docs.swaylend.com/swaypoints"
          target="_blank"
          rel="noreferrer"
          className="underline ml-1"
        >
          Learn more
        </a>
      </div>
      {/* DESKTOP */}
      <div className="max-lg:hidden">
        <div className="flex justify-between items-center px-16 min-h-[93px]">
          <div className="flex items-center gap-x-[70px]">
            <Link href="/" prefetch={false}>
              <Image src={Logo} alt="logo" />
            </Link>
            <div className="flex items-center gap-x-[25px] h-full">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    changeMarketMode(MARKET_MODE.BORROW);
                    router.push('/');
                  }}
                  className={cn(
                    pathname === '/' && marketMode === MARKET_MODE.BORROW
                      ? 'text-primary'
                      : 'text-lavender',
                    (pathname !== '/' || marketMode !== MARKET_MODE.BORROW) &&
                      'hover:text-lavender/80',
                    'flex items-center cursor-pointer justify-center text-md font-semibold min-h-[93px]'
                  )}
                >
                  Borrow
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    changeMarketMode(MARKET_MODE.LEND);
                    router.push('/');
                  }}
                  className={cn(
                    pathname === '/' && marketMode === MARKET_MODE.LEND
                      ? 'text-primary'
                      : 'text-lavender',
                    (pathname !== '/' || marketMode !== MARKET_MODE.LEND) &&
                      'hover:text-lavender/80',
                    'flex items-center cursor-pointer justify-center text-md font-semibold  min-h-[93px]'
                  )}
                >
                  Earn
                </button>
              </div>
              {NAVBAR_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} prefetch={false}>
                  <div
                    className={cn(
                      pathname === href ? 'text-primary' : 'text-lavender',
                      pathname !== href && 'hover:text-lavender/80',
                      'flex items-center justify-center text-md font-semibold  min-h-[93px]'
                    )}
                  >
                    {label}
                  </div>
                </Link>
              ))}
              <DropdownMenu open={openBridge} onOpenChange={setOpenBridge}>
                <DropdownMenuTrigger>
                  <div className="text-lavender outline-none border-none focus:outline-none focus:border-none hover:text-lavender/80 text-md font-semibold flex items-center gap-x-1">
                    Bridges
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem>
                    <div
                      onMouseDown={() => {
                        trackExternalPageView(
                          `${appConfig.client.fuelExplorerUrl}/bridge`
                        );
                        window.open(
                          `${appConfig.client.fuelExplorerUrl}/bridge`,
                          '_blank'
                        );
                        setOpenBridge(false);
                      }}
                      rel="noreferrer"
                      className="w-full"
                    >
                      <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2 cursor-pointer hover:underline">
                        Official Fuel Bridge
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div
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
                      className="w-full"
                    >
                      <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2 cursor-pointer hover:underline">
                        Orbiter Bridge
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu open={openDex} onOpenChange={setOpenDex}>
                <DropdownMenuTrigger>
                  <div className="text-lavender outline-none border-none focus:outline-none focus:border-none hover:text-lavender/80 text-md font-semibold flex items-center gap-x-1">
                    Swap
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem>
                    <div
                      onMouseDown={() => {
                        trackExternalPageView('https://mira.ly/');
                        window.open('https://mira.ly/', '_blank');
                        setOpenDex(false);
                      }}
                      rel="noreferrer"
                      className="w-full"
                    >
                      <div className="w-full flex items-center justify-between text-md font-medium text-lavender py-1 px-0.5 gap-x-2 cursor-pointer hover:underline">
                        MIRA
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Points />
            {!mobile && <ConnectButton />}
          </div>
        </div>
        <Line />
      </div>

      {/* MOBILE */}
      <div className="hidden max-lg:block">
        <div className="flex justify-between items-center px-4 h-[80px]">
          <Link href="/" prefetch={false}>
            <Image src={Logo} alt="logo" />
          </Link>
          <div className="flex items-center gap-x-2">
            <Points />
            {!mobile && <ConnectButton />}
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
          <DrawerContent className="h-dvh">
            <VisuallyHidden.Root>
              <DrawerHeader>
                <DrawerTitle>Hamburger Menu</DrawerTitle>
              </DrawerHeader>
            </VisuallyHidden.Root>
            <div className="flex flex-col items-center w-full h-full justify-center">
              <div className="flex justify-between w-full items-center px-8 h-[80px]">
                <a href="https://swaylend.com" target="_blank" rel="noreferrer">
                  <Image src={Logo} alt="logo" />
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
                  <Link
                    href="/"
                    onMouseDown={() => setOpen(false)}
                    prefetch={false}
                  >
                    <div
                      className={cn(
                        pathname === '/' ? 'text-primary' : 'text-lavender',
                        pathname !== '/' && 'hover:text-lavender/80',
                        'flex font-bold text-xl items-center gap-x-2 h-full'
                      )}
                    >
                      Dashboard
                    </div>
                  </Link>
                  {NAVBAR_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onMouseDown={() => setOpen(false)}
                      prefetch={false}
                    >
                      <div
                        className={cn(
                          pathname === href ? 'text-primary' : 'text-lavender',
                          pathname !== href && 'hover:text-lavender/80',
                          'flex font-bold text-xl items-center gap-x-2 h-full'
                        )}
                      >
                        {label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
