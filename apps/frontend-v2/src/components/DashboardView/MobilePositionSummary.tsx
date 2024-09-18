import {
  useBorrowCapacity,
  useUserCollateralUtilization,
  useUserCollateralValue,
  useUserSupplyBorrow,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { useIsConnected } from '@fuels/react';
import { CircleXIcon, PlusCircleIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Line } from '../Line';

export const MobilePositionSummary = () => {
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
    <div className="lg:hidden mt-[30px] w-full">
      <div className="flex flex-col items-center justify-center gap-y-1">
        {!open ? (
          <button type="button" onClick={() => setOpen(true)}>
            <PlusCircleIcon className="w-[24px] h-[24px] text-primary" />
          </button>
        ) : (
          <button type="button" onClick={() => setOpen(false)}>
            <CircleXIcon className="w-[24px] h-[24px] text-primary" />
          </button>
        )}
        <div className="text-primary font-medium">Position Summary</div>
      </div>
      {open && (
        <div className="w-full flex justify-center mt-4">
          <div className="w-[75%] sm:w-[60%]">
            <Line />
            <div className="w-full flex flex-col gap-y-4 p-4">
              <div className="text-md font-semibold text-lavender flex justify-between">
                <div>Available to Borrow</div>
                <div className="text-primary text-right">
                  {borrowCapacity?.toFormat(2)} USD
                </div>
              </div>
              <div className="text-md font-semibold flex text-lavender justify-between">
                <div>Liquidation point</div>
                <div className="text-primary text-right">
                  ${userLiquidationPoint?.toFormat(2)}
                </div>
              </div>
              <div className="text-md font-semibold flex text-lavender justify-between">
                <div>Collateral Utilization</div>
                <div className="text-primary text-right">
                  {collateralUtilization?.times(100).toFormat(2)}%
                </div>
              </div>
              <div className="text-md font-semibold flex text-lavender justify-between">
                <div>Collateral Value</div>
                <div className="text-primary text-right">
                  ${collateralValue?.toFormat(2)}
                </div>
              </div>
            </div>
            <Line />
          </div>
        </div>
      )}
    </div>
  );
};
