'use client';
import React from 'react';
import { InputDialog } from '../InputDialog';
import { RedeemReferralDialog } from '../RedeemReferralDialog';
import { SuccessDialog } from '../SuccessDialog';
import { AssetsTable } from './AssetsTable';
import { MarketSwitch } from './MarketSwitch';
import { MobilePositionSummary } from './MobilePositionSummary';
import { Stats } from './Stats';

export const DashboardView = () => {
  return (
    <div className="pt-[33px] sm:pt-[55px] pb-[55px] sm:px-[40px] xl:px-[88px] flex flex-col w-full items-center justify-center">
      <Stats />
      <MobilePositionSummary />
      <MarketSwitch />
      <AssetsTable />
      <InputDialog />
      <SuccessDialog />
      <RedeemReferralDialog />
    </div>
  );
};
