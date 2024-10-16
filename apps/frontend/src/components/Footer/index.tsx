'use client';

import { BookTextIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import GITHUB from '/public/icons/GitHub_Invertocat_Light.png';
import Logo from '/public/icons/dark-logo.svg?url';
import DISCORD from '/public/icons/discord-mark-white.svg?url';
import HalbornLogo from '/public/icons/halborn-logo.svg?url';
import OttersecLogo from '/public/icons/ottersec-logo.svg?url';
import X from '/public/icons/x-logo-white.png';
import { Line } from '../Line';

export const Footer = () => {
  return (
    <div>
      <div className="flex flex-col items-center overflow-hidden py-4 text-moon text-xs sm:text-md">
        <Line />
        <div className="w-full flex justify-between mt-8 px-[20px] sm:px-[40px] xl:px-[88px]">
          <div className="md:w-1/3 sm:2/5 w-full max-sm:flex max-sm:flex-col justify-center items-center">
            <Link href="/" prefetch={false}>
              <Image src={Logo} height={50} alt="logo" />
            </Link>
            <div className="sm:text-xl font-semibold text-lavender mt-8 max-sm:text-center text-lg">
              Lending reimagined, powered by Fuel.
            </div>

            <div className="flex sm:hidden mt-8 gap-x-8">
              <a
                href="https://twitter.com/swaylend"
                target="_blank"
                rel="noreferrer"
              >
                <Image src={X} alt="X logo" width={20} height={20} />
              </a>
              <a
                href="https://discord.gg/7N796pdHNk"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={DISCORD}
                  alt="Discord logo"
                  height={20}
                  width={20}
                />
              </a>
              <a
                href="https://github.com/swaylend"
                target="_blank"
                rel="noreferrer"
              >
                <Image src={GITHUB} alt="Github logo" width={20} height={20} />
              </a>
              <a
                href="https://docs.swaylend.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BookTextIcon className="w-[20px] h-[20px] text-white" />
              </a>
            </div>

            <div className="mt-8">
              <div className="text-primary items-center text-xs font-semibold">
                Audited by
              </div>
              <div className="mt-1 flex items-center gap-x-4">
                <a
                  href="https://www.halborn.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={HalbornLogo}
                    height={96}
                    width={112}
                    alt="Halborn logo"
                  />
                </a>
                <a href="https://osec.io/" target="_blank" rel="noreferrer">
                  <Image src={OttersecLogo} height={96} width={96} alt="logo" />
                </a>
              </div>
            </div>
          </div>
          <div className="hidden min-h-max sm:flex max-w-1/3 flex-col justify-between">
            <div />
            <div className="flex gap-x-16 justify-end">
              <div>
                <div className="text-primary text-sm font-semibold">LEARN</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <a
                    href="https://docs.swaylend.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://medium.com/@swaylend"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Blog
                  </a>
                </div>
              </div>
              <div>
                <div className="text-primary text-sm font-semibold">LEGAL</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <a
                    href="https://docs.swaylend.com/legal/swaylend-website-terms-of-use"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms of Use
                  </a>
                  <a
                    href="https://docs.swaylend.com/legal/terms-and-condition"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms & Conditions
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-x-8">
              <a
                href="https://twitter.com/swaylend"
                target="_blank"
                rel="noreferrer"
              >
                <Image src={X} alt="X logo" width={20} height={20} />
              </a>
              <a
                href="https://discord.gg/7N796pdHNk"
                target="_blank"
                rel="noreferrer"
              >
                <Image src={DISCORD} alt="Discord logo" height={20} />
              </a>
              <a
                href="https://github.com/swaylend"
                target="_blank"
                rel="noreferrer"
              >
                <Image src={GITHUB} alt="GitHub logo" width={21} height={21} />
              </a>
              <a
                href="https://docs.swaylend.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BookTextIcon className="w-[20px] h-[20px] text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
