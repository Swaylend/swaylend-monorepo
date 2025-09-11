'use client';

import { BookTextIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '/public/icons/dark-logo.svg?url';
import DISCORD from '/public/icons/discord-mark-white.svg?url';
import GITHUB from '/public/icons/GitHub_Invertocat_Light.png';
import HalbornLogo from '/public/icons/halborn-logo.svg?url';
import OttersecLogo from '/public/icons/ottersec-logo.svg?url';
import X from '/public/icons/x-logo-white.png';
import { Line } from '../v1/line';

export const Footer = () => {
  return (
    <div>
      <div className="flex flex-col items-center overflow-hidden py-4 text-moon text-xs sm:text-md">
        <Line />
        <div className="mt-8 flex w-full justify-between px-[20px] sm:px-[40px] xl:px-[88px]">
          <div className="sm:2/5 w-full items-center justify-center max-sm:flex max-sm:flex-col md:w-1/3">
            <Link href="/" prefetch={false}>
              <Image alt="logo" height={50} src={Logo} />
            </Link>
            <div className="mt-8 font-semibold text-lavender text-lg max-sm:text-center sm:text-xl">
              Lending reimagined, powered by Fuel.
            </div>

            <div className="mt-8 flex gap-x-8 sm:hidden">
              <a
                href="https://twitter.com/swaylend"
                rel="noreferrer"
                target="_blank"
              >
                <Image alt="X logo" height={20} src={X} width={20} />
              </a>
              <a
                href="https://discord.gg/7N796pdHNk"
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt="Discord logo"
                  height={20}
                  src={DISCORD}
                  width={20}
                />
              </a>
              <a
                href="https://github.com/swaylend"
                rel="noreferrer"
                target="_blank"
              >
                <Image alt="Github logo" height={20} src={GITHUB} width={20} />
              </a>
              <a
                href="https://swaylend.gitbook.io/swaylend-docs/"
                rel="noreferrer"
                target="_blank"
              >
                <BookTextIcon className="h-[20px] w-[20px] text-white" />
              </a>
            </div>

            <div className="mt-8">
              <div className="items-center font-semibold text-primary text-xs">
                Audited by
              </div>
              <div className="mt-1 flex items-center gap-x-4">
                <a
                  href="https://www.halborn.com/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <Image
                    alt="Halborn logo"
                    height={96}
                    src={HalbornLogo}
                    width={112}
                  />
                </a>
                <a href="https://osec.io/" rel="noreferrer" target="_blank">
                  <Image alt="logo" height={96} src={OttersecLogo} width={96} />
                </a>
              </div>
            </div>
          </div>
          <div className="hidden min-h-max max-w-1/3 flex-col justify-between sm:flex">
            <div />
            <div className="flex justify-end gap-x-16">
              <div>
                <div className="font-semibold text-primary text-sm">LEARN</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <a
                    href="https://swaylend.gitbook.io/swaylend-docs/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://medium.com/@swaylend"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Blog
                  </a>
                </div>
              </div>
              <div>
                <div className="font-semibold text-primary text-sm">LEGAL</div>
                <div className="mt-2 flex flex-col gap-y-1">
                  <a
                    href="https://swaylend.gitbook.io/swaylend-docs/legal/swaylend-website-terms-of-use"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Terms of Use
                  </a>
                  <a
                    href="https://swaylend.gitbook.io/swaylend-docs/legal/terms-and-condition"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Terms & Conditions
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-x-8">
              <a
                href="https://twitter.com/swaylend"
                rel="noreferrer"
                target="_blank"
              >
                <Image alt="X logo" height={20} src={X} width={20} />
              </a>
              <a
                href="https://discord.gg/7N796pdHNk"
                rel="noreferrer"
                target="_blank"
              >
                <Image alt="Discord logo" height={20} src={DISCORD} />
              </a>
              <a
                href="https://github.com/swaylend"
                rel="noreferrer"
                target="_blank"
              >
                <Image alt="GitHub logo" height={21} src={GITHUB} width={21} />
              </a>
              <a
                href="https://swaylend.gitbook.io/swaylend-docs/"
                rel="noreferrer"
                target="_blank"
              >
                <BookTextIcon className="h-[20px] w-[20px] text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
