import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useBorrowCapacity,
  useBorrowRate,
  usePrice,
  useSupplyRate,
  useUserCollateralValue,
  useUserSupplyBorrow,
  useUserTrueCollateralValue,
} from '@/hooks';
import { useUserCollateralUtilization } from '@/hooks/useUserCollateralUtilization';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { useMarketStore } from '@/stores';
import { getBorrowApr, getSupplyApr } from '@/utils';
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
  const { data: borrowRate } = useBorrowRate();
  const { data: supplyRate } = useSupplyRate();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const collateralUtilization = useUserCollateralUtilization();
  const collateralValue = useUserCollateralValue();
  const userLiquidationPoint = useUserLiquidationPoint();

  const bowlMode = useMemo(() => {
    if (userSupplyBorrow?.borrowed.gt(0)) return 2;
    if (marketMode === 'borrow') return 1;
    if (marketMode === 'lend') return 0;
  }, [userSupplyBorrow, marketMode]);

  const waveHeight = useMemo(() => {
    if (!collateralUtilization || collateralUtilization.eq(0)) return 0;
    return -1.5 * Number(collateralUtilization.times(100).toFixed(2)) + 150;
  }, [collateralUtilization]);
  console.log('wave height', waveHeight);

  const waveColor = useMemo(() => {
    if (!collateralUtilization || collateralUtilization.eq(0))
      return WAVE_COLORS.normal;
    if (collateralUtilization.lt(0.6)) return WAVE_COLORS.normal;
    if (collateralUtilization.lt(0.8)) return WAVE_COLORS.warning;
    return WAVE_COLORS.danger;
  }, [collateralUtilization]);

  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);

  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="w-[174px] h-[174px] bg-background rounded-full flex items-center p-2 justify-center">
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
                className={`w-full h-full ${bowlMode === 2 && 'bg-white/5 ring-2 ring-white/20'} flex-col ${bowlMode === 1 && 'bg-purple-500 text-neutral2'} ${bowlMode === 0 && 'bg-accent text-neutral6'} rounded-full flex justify-center items-center text-xl text-center font-semibold`}
              >
                {bowlMode === 2 && (
                  <div className="z-10 text-lg text-neutral2 font-bold">
                    Liquidation Risk
                    <div>{collateralUtilization.times(100).toFixed(2)}%</div>
                  </div>
                )}
                {bowlMode === 1 && (
                  <div>
                    Borrow APR
                    <div>{borrowApr}</div>
                  </div>
                )}
                {bowlMode === 0 && (
                  <div>
                    Supply APR
                    <div>{supplyApr}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`${bowlMode !== 2 && 'hidden'}`}
          side="bottom"
        >
          <div className="p-1">
            <div className="font-bold">Position Summary</div>
            <div className="text-sm text-gray-400">
              Available to Borrow: {borrowCapacity?.toFormat(2)} USD
            </div>
            <div className="text-sm text-gray-400">
              Liquidation point: ${userLiquidationPoint?.toFormat(2)}
            </div>
            <div className="text-sm text-gray-400">
              Collateral Utilization:{' '}
              {collateralUtilization?.times(100).toFormat(2)}%
            </div>
            <div className="text-sm text-gray-400">
              Collateral Value: ${collateralValue?.toFormat(2)}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
