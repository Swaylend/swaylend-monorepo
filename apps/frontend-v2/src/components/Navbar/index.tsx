'use client';
import { cn } from '@/lib/utils';
import { ChartLine, Coins, Ham, icons, LayoutDashboard, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Logo from '/public/icons/dark-logo.svg?url';
import LogoIcon from '/public/icons/sway-icon-logo.svg?url';
import { Line } from '../Line';
import { ConnectButton } from './ConnectButton';
import { MarketSwitcher } from './MarketSwitcher';
import { Points } from './Points';
import { useMediaQuery } from 'usehooks-ts';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '../ui/button';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';



const NAVBAR_LINKS = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/market', label: 'Market', icon: <ChartLine /> },
  { href: '/faucet', label: 'Faucet', icon: <Coins /> },
];

export const Navbar = () => {
  const pathname = usePathname();
  const mobile = useMediaQuery('(max-width: 640px)')
  const [open, setOpen] = useState(false);
  if (!mobile) {

    return (
      <>
        <div className="flex justify-between items-center px-16 h-[93px]">
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
      </>
    );
  }
  return (<div>
    <div className="flex justify-between items-center px-4 h-[80px]">
      <Link href="https://swaylend.com">
        <Image src={LogoIcon} alt="logo" />
      </Link>
      <div className="flex items-center gap-x-2">
        <Points />
        {/* <MarketSwitcher /> */}
        <ConnectButton />
        <Button onClick={() => setOpen(true)} className='rounded-full w-[40px] h-[40px] p-0' variant={'tertiary'}>
          <Menu className='w-5 h-5' />
        </Button>
      </div>
    </div>
    <Line />

    <Drawer
      open={open}
      onOpenChange={setOpen}>
      <DrawerContent className='h-screen'>
        <VisuallyHidden.Root>

          <DrawerHeader>
            <DrawerTitle>Hamburger Menu</DrawerTitle>
          </DrawerHeader>
        </VisuallyHidden.Root>
        <div className='flex flex-col items-center w-full h-full justify-center'>

          <div className="flex justify-between w-full items-center px-4 h-[80px]">
            <Link href="https://swaylend.com">
              <Image src={LogoIcon} alt="logo" />
            </Link>
            <Button onClick={() => setOpen(false)} className='rounded-full w-[40px] h-[40px] p-0' variant={'tertiary'}>
              <X className='w-5 h-5' />
            </Button>
          </div>

          <div className='h-full flex flex-col justify-between items-start px-8 w-full py-16 mt-8'>

            <div className="flex flex-col w-full h-full items-start gap-y-8  pt-16">
              {NAVBAR_LINKS.map(({ href, label, icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}>
                  <div
                    className={cn(
                      pathname === href ? 'text-primary' : 'text-neutral2',
                      pathname === href ? '' : 'hover:text-neutral2/80',
                      'flex font-bold text-3xl items-center gap-x-2 h-full relative'
                    )}
                  >
                    {label}
                  </div>
                </Link>
              ))}
            </div>

            <div className='w-full flex-col flex gap-y-2  mt-16'>
              <div className='pl-4'>Market</div>
              <MarketSwitcher />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>

  </div>)
};
