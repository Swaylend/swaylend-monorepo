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
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-start pt-[33px] pb-[55px] sm:px-[40px] sm:pt-[55px] xl:px-[88px]">
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
