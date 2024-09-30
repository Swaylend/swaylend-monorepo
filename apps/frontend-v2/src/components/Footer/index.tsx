'use client';

import { MARKET_MODE, useMarketStore } from '@/stores';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Logo from '/public/icons/dark-logo.svg?url';
import HalbornLogo from '/public/icons/halborn-logo.svg?url';
import OttersecLogo from '/public/icons/ottersec-logo.svg?url';
import { Line } from '../Line';

export const Footer = () => {
  const { changeMarketMode } = useMarketStore();
  return (
    <div>
      <div className="relative flex flex-col items-center overflow-hidden py-4 text-moon text-xs sm:text-md">
        <Line />
        <div className="lg:max-w-[1000px] md:px-8 w-full">
          <div className="w-full flex max-md:flex-col max-md:items-center justify-between mt-4">
            <div className="flex justify-center md:justify-start md:gap-x-12 gap-x-4 w-4/5">
              <div>
                <div className="text-primary text-md">App</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <Link
                    href="/"
                    onClick={() => changeMarketMode(MARKET_MODE.BORROW)}
                  >
                    <div>Borrow</div>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => changeMarketMode(MARKET_MODE.LEND)}
                  >
                    <div>Earn</div>
                  </Link>
                  <Link href="/market">
                    <div>Markets</div>
                  </Link>
                </div>
              </div>
              <div>
                <div className="text-primary text-md">Resources</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <a
                    href="https://docs.swaylend.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://github.com/swaylend"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <div>
                <div className="text-primary text-md">Community</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <a
                    href="https://discord.gg/m9VcnNG2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Discord
                  </a>
                  <a
                    href="https://twitter.com/swaylend"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </div>
            <div className="md:w-1/5 items-end max-md:mt-8 max-md:w-full max-md:items-center flex flex-col gap-y-4">
              <Link href="/">
                <Image src={Logo} alt="logo" />
              </Link>
              <div className="text-primary items-center font-semibold text-md flex gap-x-2">
                Secured by
              </div>
              <a
                href="https://www.halborn.com/"
                target="_blank"
                rel="noreferrer"
                className="md:mt-[-8px]"
              >
                <Image src={HalbornLogo} height={96} width={96} alt="logo" />
              </a>
              {/* <a href="https://osec.io/" target="_blank" rel="noreferrer">
                <Image src={OttersecLogo} height={96} width={96} alt="logo" />
              </a> */}
            </div>
          </div>
        </div>
        <div className="absolute top-[calc(80%)] w-full flex justify-center z-[-10]">
          <div className="opacity-60 blur-[45px] rounded-full w-[32%] sm:w-[500px] aspect-square bg-primary" />
        </div>
      </div>
    </div>
  );
};
