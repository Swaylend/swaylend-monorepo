import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  useBorrowCapacity,
  useHealthFactor,
  useLTV,
  useMarketConfiguration,
  usePrice,
  useUserLiquidationPoint,
  useUserSupplyBorrow,
} from '@/hooks/v1';
import { getFormattedPrice } from '@/utils';
import PlusIcon from '/public/icons/plus-filled.svg?url';
import XIcon from '/public/icons/x-filled.svg?url';
import { InfoIcon } from '../info-icon';
import { Line } from '../line';

export const BorrowPositionSummary = () => {
  const { isConnected } = useIsConnected();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userLiquidationPoint } = useUserLiquidationPoint();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();
  const [open, setOpen] = useState(false);
  const { data: ltv } = useLTV();
  const { data: healthFactor } = useHealthFactor();

  const updatedBorrowCapacity = useMemo(() => {
    if (!(marketConfiguration && priceData && borrowCapacity)) {
      return BigNumber(0);
    }
    let updatedBorrowCapacity = borrowCapacity?.minus(
      BigNumber(1).div(
        priceData?.prices[marketConfiguration?.baseToken.bits ?? ''] ?? 1
      )
    );

    updatedBorrowCapacity = updatedBorrowCapacity?.lt(0)
      ? BigNumber(0)
      : updatedBorrowCapacity;

    return updatedBorrowCapacity;
  }, [marketConfiguration, borrowCapacity, priceData]);

  if (!(isConnected && userSupplyBorrow) || userSupplyBorrow.borrowed.eq(0)) {
    return null;
  }

  return (
    <>
      <div className="relative w-full">
        <div className="absolute top-[10px] left-[calc(50%-2px)] z-0 h-[16px] w-[4px] bg-linear-to-b from-white/0 to-primary md:top-[18px]" />
      </div>
      <div className="mt-[20px] w-full max-w-[800px] md:mt-[30px]">
        <div className="flex flex-col items-center justify-center gap-y-1">
          {open ? (
            <button
              className="z-10"
              onClick={() => setOpen(false)}
              type="button"
            >
              <Image alt="x" height={24} src={XIcon} width={24} />
            </button>
          ) : (
            <button
              className="z-10"
              onClick={() => setOpen(true)}
              type="button"
            >
              <Image alt="plus" height={24} src={PlusIcon} width={24} />
            </button>
          )}
          <div className="font-medium text-primary">Position Summary</div>
        </div>
        {open && (
          <div className="mt-4 flex w-full justify-center">
            <div className="w-[75%] sm:w-[60%]">
              <Line />
              <div className="flex w-full flex-col gap-y-4 p-4">
                <div className="flex justify-between font-semibold text-lavender text-md">
                  <div className="flex gap-x-1">
                    Liquidation Point{' '}
                    <InfoIcon
                      text={
                        'The price of supplied collateral at which your position will be liquidated'
                      }
                    />
                  </div>
                  <div className="text-right text-primary">
                    {getFormattedPrice(userLiquidationPoint ?? BigNumber(0))}
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lavender text-md">
                  <div className="flex gap-x-1">
                    Available To Borrow{' '}
                    <InfoIcon
                      text={'The total value of your collateral in USDC'}
                    />
                  </div>
                  <div className="text-right text-primary">
                    {getFormattedPrice(updatedBorrowCapacity)}
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lavender text-md">
                  <div className="flex gap-x-1">Loan-to-Value (LTV) Ratio </div>
                  <div className="text-right text-primary">
                    {ltv?.times(100).toFixed(2)}%
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lavender text-md">
                  <div className="flex gap-x-1">Health Factor </div>
                  <div className="text-right text-primary">
                    {healthFactor?.toFixed(2)}
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
