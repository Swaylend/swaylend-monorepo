'use client';

import { useAccount, useIsConnected } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import { Step, Stepper } from 'react-form-stepper';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { FundWallet } from './fund-wallet';
import { GeneralInfo } from './general-info';
import { TermsAndConditions } from './terms-and-conditions';

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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent
        className="h-full max-h-full w-full overflow-hidden p-0 sm:h-[80%] sm:max-h-[80%] sm:max-w-[800px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Introduction</DialogTitle>
        </VisuallyHidden.Root>
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div className="relative w-full overflow-hidden">
            <div
              className={
                '-z-10 absolute top-[62px] left-[calc(5%)] h-2 w-[90%] bg-linear-to-r from-popover via-primary to-popover'
              }
            />
            <div
              className={
                '-z-10 absolute top-[61px] left-[calc(33%)] h-8 w-[33%] rounded-full bg-primary blur-2xl'
              }
            />
            <div className="flex h-16 w-full items-center justify-center text-lg">
              <h1 className="font-semibold text-lavender text-lg">
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
          <div className="flex h-full flex-1 flex-col overflow-hidden px-4 max-sm:px-2">
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
