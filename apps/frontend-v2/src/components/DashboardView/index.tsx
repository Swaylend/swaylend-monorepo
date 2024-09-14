'use client';
import React from 'react';
import { InputDialog } from '../InputDialog';
import { RedeemReferralDialog } from '../RedeemReferralDialog';
import { ErrorToast, InfoToast, TransactionSuccessToast } from '../Toasts';
import { AssetsTable } from './AssetsTable';
import { MarketSwitch } from './MarketSwitch';
import { Stats } from './Stats';

export const DashboardView = () => {
  return (
    <div className="pt-[33px] sm:pt-[55px] pb-[55px] sm:px-[40px] xl:px-[88px] flex flex-col w-full items-center justify-center">
      <Stats />
      <MarketSwitch />
      <button
        type="button"
        onClick={() =>
          TransactionSuccessToast({
            transactionId:
              '0x6aa991c67b9a3f034172fd57b301fa55585fdb1733e191daf4c2d1218ebe19af',
          })
        }
      >
        Open Toast
      </button>
      <button
        type="button"
        onClick={() =>
          ErrorToast({ error: 'Error sending this or that babeeeyyyy' })
        }
      >
        Open Toast Err
      </button>
      <button
        type="button"
        onClick={() =>
          InfoToast({
            title: 'Info!',
            description: 'Error sending this or that babeeeyyyy',
          })
        }
      >
        Open Toast Err
      </button>
      <AssetsTable />
      <InputDialog />
      <RedeemReferralDialog />
    </div>
  );
};
