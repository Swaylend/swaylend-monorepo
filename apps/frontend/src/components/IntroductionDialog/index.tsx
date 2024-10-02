'use client';

import { useAccount, useIsConnected } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useRef, useState } from 'react';
import { Step, Stepper } from 'react-form-stepper';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { FundWallet } from './FundWallet';
import { GeneralInfo } from './GeneralInfo';
import { TermsAndConditions } from './TermsAndConditions';

const STEP_CONFIG = {
  activeBgColor: '#3FE8BD',
  activeTextColor: '#000',
  completedBgColor: '#306659',
  completedTextColor: '#FFF',
  size: '2em',
  circleFontSize: '1rem',
  labelFontSize: '0.875rem',
  labelFontWeight: 'bold',
  labelFontFamily: 'Inter',
  labelFontColor: '#000',
  labelFontStyle: 'normal',
  labelFontVariant: 'normal',
  fontWeight: '500',
  inactiveBgColor: '#666E79',
  inactiveTextColor: '#000',
  borderRadius: '50%',
};

export const IntroductionDialog = () => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  // OPEN modal if T&C missing or new account is connected
  useEffect(() => {
    // Check local storage for terms and conditions (if user has accepted them)
    const termsAndConditions = localStorage.getItem(`t&c-${account}`);

    if (isConnected && account && termsAndConditions !== 'true') {
      setActiveStep(0);
      setOpen(true);
    }
  }, [isConnected, account]);

  const handleNextStep = (step: number) => {
    setActiveStep(step);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 h-full max-h-full sm:h-[80%] sm:max-h-[80%] w-full max-w-[800px] overflow-hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Introduction</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="w-full overflow-hidden relative">
            <div
              className={
                '-z-10 w-[90%] top-[62px] h-2 bg-gradient-to-r from-popover via-primary to-popover absolute left-[calc(5%)]'
              }
            />
            <div
              className={
                '-z-10 absolute blur-2xl top-[61px] left-[calc(33%)] rounded-full w-[33%] h-8 bg-primary'
              }
            />
            <div className="w-full text-lg h-16 flex items-center justify-center">
              <h1 className="text-lavender font-semibold text-lg">
                Introduction
              </h1>
            </div>
          </div>
          <div className="w-full py-4">
            <Stepper
              activeStep={activeStep}
              connectorStateColors
              connectorStyleConfig={{
                activeColor: '#3FE8BD',
                disabledColor: '#666E79',
                completedColor: '#2D8972',
                size: 2,
                style: 'solid',
              }}
            >
              <Step label="Terms & Conditions" styleConfig={STEP_CONFIG} />
              <Step label="Fund Wallet" styleConfig={STEP_CONFIG} />
              <Step label="Finish" styleConfig={STEP_CONFIG} />
            </Stepper>
          </div>
          <div className="max-sm:px-2 px-4 overflow-hidden h-full flex-1 flex flex-col">
            {activeStep === 0 && (
              <TermsAndConditions setActiveStep={handleNextStep} />
            )}
            {activeStep === 1 && <FundWallet setActiveStep={handleNextStep} />}
            {activeStep === 2 && <GeneralInfo setOpen={setOpen} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
