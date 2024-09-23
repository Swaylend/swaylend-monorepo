'use client';

import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Stepper, Step } from 'react-form-stepper';
import { TermsAndConditions } from './TermsAndConditions';
import { FundWallet } from './FundWallet';
import { GeneralInfo } from './GeneralInfo';
import { useAccount, useIsConnected } from '@fuels/react';

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

  // OPEN if T&C missing || new account?

  useEffect(() => {
    // Check local storage for terms and conditions (if user has accepted them)
    const termsAndConditions = localStorage.getItem(`t&c-${account}`);

    if (isConnected && !termsAndConditions) {
      setActiveStep(0);
      setOpen(true);
    }
  }, [isConnected, account]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 h-[80%] max-h-[80%] max-md:w-[90%] max-sm:rounded-xl max-w-[800px] overflow-hidden"
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
              className={cn(
                '-z-10 w-[90%] top-[62px] h-2 bg-gradient-to-r from-popover via-primary to-popover absolute left-[calc(5%)]'
              )}
            />
            <div
              className={cn(
                '-z-10 absolute blur-2xl top-[61px] left-[calc(33%)] rounded-full w-[33%] h-8 bg-primary'
              )}
            />
            <div className="w-full text-lg h-16 flex items-center justify-center">
              <h1 className="text-lavender font-semibold text-lg">
                Introduction
              </h1>
            </div>
          </div>

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

          <div className="px-8 mt-4 min-h-[70%]">
            {activeStep === 0 && (
              <TermsAndConditions setActiveStep={setActiveStep} />
            )}
            {activeStep === 1 && <FundWallet setActiveStep={setActiveStep} />}
            {activeStep === 2 && (
              <GeneralInfo setOpen={setOpen} setActiveStep={setActiveStep} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
