import { useIsConnected } from '@fuels/react';
import { useMediaQuery } from '@mantine/hooks';
import { useMemo } from 'react';
import Wave from 'react-wavify';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NetBorrowTooltip } from '@/components/v2/net-borrow-tooltip';
import { NetEarnTooltip } from '@/components/v2/net-earn-tooltip';
import {
  useApr,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores/market-store';

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
  const marketMode = useMarketStore.use.marketMode();
  const { isConnected } = useIsConnected();

  const { data: userSupplyBorrow, isPending: isPendingUserSupplyBorrow } =
    useUserSupplyBorrow();
  const { data: collateralUtilization } = useUserCollateralUtilization();
  const { data: collateralBalances } = useUserCollateralAssets();

  const matches = useMediaQuery('(max-width:640px)');

  const bowlMode = useMemo(() => {
    if (userSupplyBorrow?.borrowed.gt(0) && isConnected) return 2;
    if (marketMode === 'borrow') return 1;
    if (marketMode === 'lend') return 0;
  }, [userSupplyBorrow, marketMode, isConnected]);

  const waveHeight = useMemo(() => {
    if (!collateralUtilization || collateralUtilization.eq(0)) return 0;
    if (matches) {
      return -1 * Number(collateralUtilization.times(100).toFixed(2)) + 100;
    }
    return -1.5 * Number(collateralUtilization.times(100).toFixed(2)) + 150;
  }, [collateralUtilization, collateralBalances]);

  const waveColor = useMemo(() => {
    if (!collateralUtilization || collateralUtilization.eq(0)) {
      return WAVE_COLORS.normal;
    }
    if (collateralUtilization.lt(0.6)) return WAVE_COLORS.normal;
    if (collateralUtilization.lt(0.8)) return WAVE_COLORS.warning;
    return WAVE_COLORS.danger;
  }, [collateralUtilization, collateralBalances]);

  const { data: aprData, isPending: isAprPending } = useApr();

  const isLoading = useMemo(() => {
    if (!isConnected) return isAprPending;

    return [
      isPendingUserSupplyBorrow,
      isAprPending,
      collateralUtilization == null || !collateralUtilization?.isFinite(),
    ].some((res) => res);
  }, [
    isConnected,
    isAprPending,
    isPendingUserSupplyBorrow,
    collateralUtilization,
  ]);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger
          className="cursor-default"
          onClick={(e) => e.preventDefault()}
        >
          <div className="flex h-[124px] w-[124px] items-center justify-center rounded-full bg-background p-2 sm:h-[174px] sm:w-[174px]">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-full bg-primary/20 ring-2 ring-white/20" />
            ) : (
              <div
                className={`relative z-10 h-full w-full ${bowlMode === 2 && 'cursor-pointer'}`}
              >
                {bowlMode === 2 && (
                  <>
                    <Wave
                      className="absolute top-0 left-0 z-0 flex h-full w-full"
                      fill={waveColor.colorUpper}
                      mask="url(#mask)"
                      options={{
                        height: waveHeight,
                        amplitude: 10,
                        speed: 0.17,
                        points: 3,
                      }}
                      paused={false}
                    >
                      <mask id="mask">
                        <rect
                          fill="white"
                          height="100%"
                          rx={100}
                          width="100%"
                          x="0"
                          y="0"
                        />
                      </mask>
                    </Wave>
                    <Wave
                      className="absolute top-0 left-0 z-0 flex h-full w-full"
                      fill={waveColor.colorLower}
                      mask="url(#mask)"
                      options={{
                        height: waveHeight + 5,
                        amplitude: 15,
                        speed: 0.17,
                        points: 2,
                      }}
                      paused={false}
                    >
                      <mask id="mask">
                        <rect
                          fill="white"
                          height="100%"
                          rx={100}
                          width="100%"
                          x="0"
                          y="0"
                        />
                      </mask>
                    </Wave>
                  </>
                )}
                <div
                  className={`h-full w-full ${bowlMode === 2 && 'bg-white/5 ring-2 ring-white/20'} flex-col ${bowlMode === 0 && 'cursor-default bg-primary text-secondary'} ${bowlMode === 1 && 'cursor-default bg-purple text-white'} flex items-center justify-center rounded-full text-center font-semibold text-md ring-2 ring-white/20 sm:text-xl`}
                >
                  {bowlMode === 2 && (
                    <div className="z-10 font-bold text-white text-xs sm:text-lg">
                      Liquidation Risk
                      <div className="font-semibold text-lg sm:text-xl">
                        {collateralUtilization?.times(100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {bowlMode === 1 && (
                    <div className="font-bold text-sm text-white sm:text-lg">
                      Net Borrow APY
                      <div className="font-semibold text-lg sm:text-xl">
                        {aprData?.netBorrowApr.times(100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {bowlMode === 0 && (
                    <div className="font-bold text-primary-foreground text-sm sm:text-lg">
                      Net Earn APY
                      <div className="font-semibold text-lg sm:text-xl">
                        {aprData?.netSupplyApr.times(100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={cn(
            (bowlMode === undefined || isAprPending) && 'hidden',
            'w-[300px]',
            'max-lg:hidden'
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          side="bottom"
        >
          {bowlMode === 2 && (
            <div className="p-1">
              <span className="font-semibold text-primary">
                Liquidation Risk{' '}
              </span>
              is a measure of how close your position is to being{' '}
              <span className="font-semibold text-red-500"> liquidated</span>.
              The higher the percentage, the closer you are to liquidation. Upon
              reaching <span className="font-semibold text-red-500"> 100%</span>
              , your position will be{' '}
              <span className="font-semibold text-red-500"> liquidated</span>.
            </div>
          )}
          {bowlMode === 1 && (
            <div className="p-1">
              <NetBorrowTooltip aprData={aprData} />
            </div>
          )}
          {bowlMode === 0 && (
            <div className="w-full p-1">
              <NetEarnTooltip aprData={aprData} />
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
