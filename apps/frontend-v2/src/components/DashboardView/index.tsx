'use client';
import React from 'react';
import { InputDialog } from '../InputDialog';
import { RedeemReferralDialog } from '../RedeemReferralDialog';
import { AssetsTable } from './AssetsTable';
import { MarketSwitch } from './MarketSwitch';
import { Stats } from './Stats';
import { useUserRole } from '@/hooks';

export const DashboardView = () => {
  return (
    <div className="pt-[33px] sm:pt-[55px] pb-[55px] sm:px-[40px] xl:px-[88px] flex flex-col w-full items-center justify-center">
      <Stats />
      <MarketSwitch />
      <AssetsTable />
      <InputDialog />
      <RedeemReferralDialog />
    </div>
  );
};
