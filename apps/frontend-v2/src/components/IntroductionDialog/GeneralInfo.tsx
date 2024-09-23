import React from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import Banner from '/public/banner.png';

export const GeneralInfo = ({
  setOpen,
  setActiveStep,
}: {
  setOpen: (val: boolean) => void;
  setActiveStep: (step: number) => void;
}) => {
  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
  };

  return (
    <div className="flex flex-col justify-between w-full h-full px-6 py-4 gap-y-2.5 rounded-md overflow-auto text-lavender">
      <div>
        <div className="text-center text-white font-semibold text-xl">
          Explore SwayLend
        </div>

        <div className="w-full mt-4">
          <Image src={Banner} alt="a" width={1500} height={500} />
        </div>
        <div className="mt-8 text-lg">
          SwayLend is a lending protocol that allows users to{' '}
          <span className="text-primary font-semibold">Borrow</span> OR{' '}
          <span className="text-purple-400 font-semibold">Lend</span> assets.
          <div className="mt-20">
            To learn more about how SwayLend works, visit the{' '}
            <a
              href="https://docs.swaylend.com/"
              className="text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              Official Documentation
            </a>
            .
          </div>
        </div>
      </div>

      <div className="mt-16 flex w-full justify-end">
        <Button onClick={handleClose}>Finish</Button>
      </div>
    </div>
  );
};
