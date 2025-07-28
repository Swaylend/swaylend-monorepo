'use client';
import { InputDialog } from '../input-dialog';
import { RedeemReferralDialog } from '../redeem-referral-dialog';
import { SuccessDialog } from '../success-dialog';
import { AssetsTable } from './assets-table';
import { BorrowPositionSummary } from './borrow-position-summary';
import { MarketSwitch } from './market-switch';
import { Stats } from './stats';

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
