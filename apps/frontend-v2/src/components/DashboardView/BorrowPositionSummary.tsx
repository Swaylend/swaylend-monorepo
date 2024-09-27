import {
  useBorrowCapacity,
  useUserCollateralUtilization,
  useUserCollateralValue,
  useUserSupplyBorrow,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { getFormattedPrice } from '@/utils';
import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { CircleXIcon, PlusCircleIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Line } from '../Line';
import Image from 'next/image';
import PlusIcon from '/public/icons/plus-filled.svg?url';
import XIcon from '/public/icons/x-filled.svg?url';
import { InfoIcon } from '../InfoIcon';

export const BorrowPositionSummary = () => {
  const { isConnected } = useIsConnected();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userLiquidationPoint } = useUserLiquidationPoint();
  const { data: collateralUtilization } = useUserCollateralUtilization();
  const { data: collateralValue } = useUserCollateralValue();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const [open, setOpen] = useState(false);

  if (!isConnected || !userSupplyBorrow || userSupplyBorrow.borrowed.eq(0))
    return null;

  return (
    <>
      <div className="relative w-full">
        <div className="absolute left-[calc(50%-4px)] top-[10px] h-[24px] z-0 w-[8px] bg-gradient-to-b from-white/0 to-primary" />
      </div>
      <div className="mt-[30px] max-w-[800px] w-full">
        <div className="flex flex-col items-center justify-center gap-y-1">
          {!open ? (
            <button
              type="button"
              className="z-10"
              onClick={() => setOpen(true)}
            >
              <Image src={PlusIcon} alt="plus" height={24} width={24} />
            </button>
          ) : (
            <button
              type="button"
              className="z-10"
              onClick={() => setOpen(false)}
            >
              <Image src={XIcon} alt="x" height={24} width={24} />
            </button>
          )}
          <div className="text-primary font-medium">Position Summary</div>
        </div>
        {open && (
          <div className="w-full flex justify-center mt-4">
            <div className="w-[75%] sm:w-[60%]">
              <Line />
              <div className="w-full flex flex-col gap-y-4 p-4">
                <div className="text-md font-semibold flex text-lavender justify-between">
                  <div className="flex gap-x-1">
                    Liquidation Point{' '}
                    <InfoIcon
                      text={
                        'The price of supplied collateral at which your position will be liquidated'
                      }
                    />
                  </div>
                  <div className="text-primary text-right">
                    {getFormattedPrice(userLiquidationPoint ?? BigNumber(0))}
                  </div>
                </div>
                <div className="text-md font-semibold text-lavender flex justify-between">
                  <div className="flex gap-x-1">
                    Available To Borrow{' '}
                    <InfoIcon
                      text={'The total value of your collateral in USDC'}
                    />
                  </div>
                  <div className="text-primary text-right">
                    {getFormattedPrice(borrowCapacity ?? BigNumber(0))}
                  </div>
                </div>
              </div>
              <Line />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
