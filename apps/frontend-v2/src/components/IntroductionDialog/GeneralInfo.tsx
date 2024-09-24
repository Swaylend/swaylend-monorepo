import Image from 'next/image';
import React from 'react';
import Banner from '/public/banner.png';
import { Button } from '../ui/button';

export const GeneralInfo = ({
  setOpen,
}: {
  setOpen: (val: boolean) => void;
}) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col justify-between w-full h-full px-6 py-4 gap-y-2.5 rounded-md text-lavender">
      <div>
        <div className="text-center text-white font-semibold text-xl">
          Before you Enter
        </div>

        <div className="w-full mt-4">
          <Image src={Banner} alt="a" width={1500} height={500} />
        </div>
        <div className="mt-8 text-lg">
          <div className="mt-4">
            While we are excited for the world to experience the first ever
            lending protocol on Fuel Network, we wanted to add some very
            important reminders. SwayLend is a new and experimental technology.
            As with all new protocols, especially in DeFi, this technology
            should be used with caution and at your own discretion.
            <br />
            <br />
            We understand and acknowledge the importance of security. We have
            employed measures such as comprehensive quality testing and external
            audits to identify and rectify any issues.
            <br />
            <br />
            SwayLend engaged with one audit firm,{' '}
            <a
              href="https://www.halborn.com/"
              className="text-primary underline"
            >
              Halborn
            </a>
            , for smart contract review. To learn more about the audit reports
            and risks involved with using SwayLend, please visit the{' '}
            <a
              href="https://docs.swaylend.com/"
              className="text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              official documentation
            </a>
            . SwayLend was built by Reserve Labs, a web3 venture studio.
          </div>
        </div>
      </div>

      <div className="mt-16 flex w-full justify-end">
        <Button onClick={handleClose}>Explore SwayLend</Button>
      </div>
    </div>
  );
};
