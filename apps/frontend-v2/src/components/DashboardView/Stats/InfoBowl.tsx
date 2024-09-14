import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useBorrowCapacity,
  useBorrowRate,
  useSupplyRate,
  useUserCollateralValue,
  useUserSupplyBorrow,
} from '@/hooks';
import { useUserCollateralUtilization } from '@/hooks/useUserCollateralUtilization';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores';
import { getBorrowApr, getSupplyApr } from '@/utils';
import { useIsConnected } from '@fuels/react';
import React, { useMemo } from 'react';
import Wave from 'react-wavify';

const WAVE_COLORS = {
  normal: {
    colorLower: '#00B493',
    colorUpper: '#1DD4A6',
  },
  warning: {
    colorLower: '#f79902',
    colorUpper: '#ffc736',
  },
  danger: {
    colorUpper: '#ff6f61',
    colorLower: '#c4391d',
  },
};

export const InfoBowl = () => {
  const { marketMode } = useMarketStore();
  const { isConnected } = useIsConnected();
  const { data: borrowRate, isPending: isPendingBorrowRate } = useBorrowRate();
  const { data: supplyRate, isPending: isPendingSupplyRate } = useSupplyRate();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow, isPending: isPendingUserSupplyBorrow } =
    useUserSupplyBorrow();
  const { data: collateralUtilization } = useUserCollateralUtilization();
  const { data: collateralValue } = useUserCollateralValue();
  const { data: userLiquidationPoint } = useUserLiquidationPoint();

  const bowlMode = useMemo(() => {
    if (userSupplyBorrow?.borrowed.gt(0) && isConnected) return 2;
    if (marketMode === 'borrow') return 1;
    if (marketMode === 'lend') return 0;
  }, [userSupplyBorrow, marketMode, isConnected]);

  const waveHeight = useMemo(() => {
    if (!collateralUtilization || collateralUtilization.eq(0)) return 0;
    return -1.5 * Number(collateralUtilization.times(100).toFixed(2)) + 150;
  }, [collateralUtilization]);

  const waveColor = useMemo(() => {
    if (!collateralUtilization || collateralUtilization.eq(0)) {
      return WAVE_COLORS.normal;
    }
    if (collateralUtilization.lt(0.6)) return WAVE_COLORS.normal;
    if (collateralUtilization.lt(0.8)) return WAVE_COLORS.warning;
    return WAVE_COLORS.danger;
  }, [collateralUtilization]);

  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);

  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  const isLoading = useMemo(() => {
    if (!isConnected) return isPendingBorrowRate || isPendingSupplyRate;
    return [
      isPendingBorrowRate,
      isPendingSupplyRate,
      isPendingUserSupplyBorrow,
    ].some((res) => res);
  }, [
    isConnected,
    isPendingBorrowRate,
    isPendingSupplyRate,
    isPendingUserSupplyBorrow,
  ]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="sm:w-[174px] sm:h-[174px] w-[124px] h-[124px] bg-background rounded-full flex items-center p-2 justify-center">
            {isLoading ? (
              <Skeleton className="w-full h-full bg-primary/20 rounded-full ring-2 ring-white/20" />
            ) : (
              <div className="w-full h-full relative">
                {bowlMode === 2 && (
                  <>
                    <Wave
                      fill={waveColor.colorUpper}
                      paused={false}
                      mask="url(#mask)"
                      className=" z-0 flex w-full h-full absolute top-0 left-0"
                      options={{
                        height: waveHeight,
                        amplitude: 10,
                        speed: 0.17,
                        points: 3,
                      }}
                    >
                      <mask id="mask">
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          fill="white"
                          rx={100}
                        />
                      </mask>
                    </Wave>
                    <Wave
                      fill={waveColor.colorLower}
                      paused={false}
                      mask="url(#mask)"
                      className=" z-0 flex w-full h-full absolute top-0 left-0"
                      options={{
                        height: waveHeight + 5,
                        amplitude: 15,
                        speed: 0.17,
                        points: 2,
                      }}
                    >
                      <mask id="mask">
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          fill="white"
                          rx={100}
                        />
                      </mask>
                    </Wave>
                  </>
                )}
                <div
                  className={`w-full h-full ${bowlMode === 2 && 'bg-white/5 ring-2 ring-white/20'} flex-col ${bowlMode === 0 && 'bg-purple-500 text-white'} ${bowlMode === 1 && 'bg-primary text-secondary'} ring-2 ring-white/20 rounded-full flex justify-center items-center sm:text-xl text-md text-center font-semibold`}
                >
                  {bowlMode === 2 && (
                    <div className="z-10 text-xs sm:text-lg text-white font-bold">
                      Liquidation Risk
                      <div className="sm:text-xl text-lg font-semibold">
                        {collateralUtilization?.times(100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {bowlMode === 1 && (
                    <div className="text-sm sm:text-lg text-primary-foreground font-bold">
                      Borrow APR
                      <div className="sm:text-xl text-lg font-semibold">
                        {borrowApr}
                      </div>
                    </div>
                  )}
                  {bowlMode === 0 && (
                    <div className="text-sm sm:text-lg text-white font-bold">
                      Supply APR
                      <div className="sm:text-xl text-lg  font-semibold">
                        {supplyApr}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={cn(bowlMode !== 2 && 'hidden', 'w-[300px]')}
          side="bottom"
        >
          <div className="p-1">
            <div className="font-bold">Position Summary</div>
            <div className="flex flex-col gap-y-1 mt-2">
              <div className="text-sm flex justify-between">
                <div className="text-lavender">Available to Borrow</div>
                <div className="font-semibold text-moon">
                  {borrowCapacity?.toFormat(2)} USD
                </div>
              </div>
              <div className="text-sm flex justify-between">
                <div className="text-lavender">Liquidation point</div>
                <div className="font-semibold text-moon">
                  ${userLiquidationPoint?.toFormat(2)}
                </div>
              </div>
              <div className="text-sm flex justify-between">
                <div className="text-lavender">Collateral Utilization</div>
                <div className="font-semibold text-moon">
                  {collateralUtilization?.times(100).toFormat(2)}%
                </div>
              </div>
              <div className="text-sm flex justify-between">
                <div className="text-lavender">Collateral Value</div>
                <div className="font-semibold text-moon">
                  ${collateralValue?.toFormat(2)}
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
