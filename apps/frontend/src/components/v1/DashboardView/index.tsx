'use client';
import { InputDialog } from '../InputDialog';
import { RedeemReferralDialog } from '../RedeemReferralDialog';
import { SuccessDialog } from '../SuccessDialog';
import { AssetsTable } from './AssetsTable';
import { BorrowPositionSummary } from './BorrowPositionSummary';
import { MarketSwitch } from './MarketSwitch';
import { Stats } from './Stats';

export const DashboardView = () => {
  return (
    <div className="pt-[33px] sm:pt-[55px] pb-[55px] sm:px-[40px] xl:px-[88px] flex flex-col w-full min-h-[80vh] items-center justify-start">
      <Stats />
      <BorrowPositionSummary />
      <MarketSwitch />
      <AssetsTable />
      <InputDialog />
      <SuccessDialog />
      <RedeemReferralDialog />
    </div>
  );
};
