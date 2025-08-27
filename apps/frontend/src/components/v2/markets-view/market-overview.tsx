'use client';

import BigNumber from 'bignumber.js';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  useApr,
  useCollateralConfigurations,
  useMarketBalanceOfBase,
  useMarketBasics,
  useMarketConfiguration,
  usePriceData,
  useTotalCollateral,
  useTotalReserves,
} from '@/hooks/v2';
import type { ChartData } from '@/lib/charts/v2';
import { cn } from '@/lib/utils';
import {
  formatUnits,
  getFormattedNumber,
  getFormattedPrice,
  SYMBOL_TO_ICON,
} from '@/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { IconPair } from '../icon-pair';
import { NetBorrowTooltip } from '../net-borrow-tooltip';
import { NetEarnTooltip } from '../net-earn-tooltip';
import { KinkChart } from './kink-chart';
import { MarketChart } from './market-chart';
import { MarketCollateralsTable } from './market-collaterals-table';

type MarketOverviewProps = {
  network: string;
  baseAsset: string;
  chartData: ChartData[] | undefined;
};

export default function MarketOverview({
  network,
  baseAsset,
  chartData,
}: MarketOverviewProps) {
  const { data: totalReserves } = useTotalReserves(baseAsset);

  const { data: aprData, isPending: isAprPending } = useApr(baseAsset);

  const { data: collateralConfigurations } =
    useCollateralConfigurations(baseAsset);
  const { data: marketConfiguration } = useMarketConfiguration(baseAsset);
  const { data: availableLiquidity } = useMarketBalanceOfBase(baseAsset);

  const { data: totalCollateral } = useTotalCollateral(baseAsset);
  const { data: marketBasics } = useMarketBasics(baseAsset);

  const { data: priceData } = usePriceData(baseAsset);

  const totalCollateralValue = useMemo(() => {
    if (!(priceData && totalCollateral && collateralConfigurations)) {
      return BigNumber(0);
    }

    return Array.from(totalCollateral.entries()).reduce(
      (sum, [assetId, value]) => {
        if (!collateralConfigurations[assetId]) return sum;
        const assetPrice =
          priceData.prices.get(assetId)?.[0]?.price ?? BigNumber(0);
        const balance = formatUnits(
          value,
          collateralConfigurations[assetId].decimals
        );
        return sum.plus(assetPrice.times(balance));
      },
      BigNumber(0)
    );
  }, [totalCollateral, priceData, collateralConfigurations]);

  const collateralization = useMemo(() => {
    if (!(marketBasics && marketConfiguration)) {
      return BigNumber(0);
    }

    const totalBorrowing = formatUnits(
      BigNumber(marketBasics?.total_borrow_base.toString() ?? 0),
      marketConfiguration?.baseTokenDecimals
    );

    return totalCollateralValue.div(totalBorrowing).times(100);
  }, [marketConfiguration, marketBasics, totalCollateralValue]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-8 px-[88px] pt-[60px] pb-[55px] max-lg:hidden">
      <div className="flex w-full items-start justify-between">
        <div className="flex w-1/3 items-center space-x-4 text-white/60">
          <Link href="/markets">
            <div className="flex items-center gap-x-2">
              <ChevronLeft className="h-6 w-6" />
              <div className="font-semibold text-[20px]">Markets</div>
            </div>
          </Link>
        </div>

        <div className="flex w-1/3 flex-col items-center justify-center">
          <IconPair
            icons={[
              {
                id: 'fuel',
                name: 'Fuel',
                path: SYMBOL_TO_ICON.FUEL,
              },
              {
                id: baseAsset.toLowerCase(),
                name: baseAsset,
                path: SYMBOL_TO_ICON[baseAsset],
              },
            ]}
          />
          <div className="mt-[24px]">
            <span className="ml-2 font-semibold text-moon text-xl">
              {network.toUpperCase()} Network
            </span>
            <span className="font-semibold text-white text-xl">
              {` · ${baseAsset}`}
            </span>
          </div>
        </div>
        <div className="w-1/3" />
      </div>

      <div className="mt-12 flex w-full justify-between">
        <div className="w-[47%]">
          <div className="max-lg:hidden">
            <div className="font-semibold text-md text-primary">
              Total Collateral
            </div>
            <div className="font-bold text-[20px] text-white">
              {getFormattedPrice(totalCollateralValue)}
            </div>
          </div>
          <MarketChart
            chartData={chartData}
            color="#3FE8BD"
            dataKey="collateralValueUsd"
          />
        </div>

        <div className="w-[47%]">
          <div className="max-lg:hidden">
            <div className="font-semibold text-md text-purple">
              Total Borrowing
            </div>
            <div className="font-bold text-[20px] text-white">
              {getFormattedPrice(
                formatUnits(
                  BigNumber(marketBasics?.total_borrow_base.toString() ?? 0),
                  marketConfiguration?.baseTokenDecimals
                )
              )}
            </div>
          </div>
          <MarketChart
            chartData={chartData}
            color="#8B5CF6"
            dataKey="borrowedValueUsd"
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-y-8 max-lg:hidden">
        <Card className="mt-8 w-full">
          <CardHeader className="bg-white/5">
            <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-lg">
              <div className="h-px w-[260px] rounded-full bg-linear-to-r from-white/0 to-primary" />
              <div className="text-center text-white">Market Stats</div>
              <div className="h-px w-[260px] rounded-full bg-linear-to-l from-white/0 to-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex justify-evenly pt-[55px]">
            <div>
              <div className="font-semibold text-primary text-sm">
                Total Earning
              </div>
              <div className="mt-2 font-semibold text-white text-xl">
                {getFormattedPrice(
                  formatUnits(
                    BigNumber(marketBasics?.total_supply_base.toString() ?? 0),
                    marketConfiguration?.baseTokenDecimals
                  )
                )}
              </div>
            </div>
            <div>
              <div className="font-semibold text-primary text-sm">
                Available Liquidity
              </div>
              <div className="mt-2 font-semibold text-white text-xl">
                {getFormattedPrice(
                  availableLiquidity?.formatted ?? BigNumber(0)
                )}
              </div>
            </div>
            <div>
              <div className="font-semibold text-primary text-sm">
                Total Reserves
              </div>
              <div className="mt-2 font-semibold text-white text-xl">
                {getFormattedPrice(
                  formatUnits(
                    totalReserves ?? BigNumber(0),
                    marketConfiguration?.baseTokenDecimals
                  )
                )}
              </div>
            </div>
            <div>
              <div className="font-semibold text-primary text-sm">
                Collateralization
              </div>
              <div
                className={cn(
                  'mt-2 font-semibold text-white text-xl',
                  !collateralization.isFinite() && 'text-center'
                )}
              >
                {collateralization.isFinite()
                  ? `${collateralization.toFixed(2, 1)}%`
                  : '-'}
              </div>
            </div>
            <div>
              <div className="font-semibold text-primary text-sm">
                Oracle Price
              </div>
              <div className="mt-2 font-semibold text-white text-xl">
                $
                {getFormattedNumber(
                  BigNumber(
                    priceData?.prices[marketConfiguration?.baseToken.bits!] ?? 0
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="bg-white/5">
            <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-lg">
              <div className="h-px w-[260px] rounded-full bg-linear-to-r from-white/0 to-primary" />
              <div className="text-center text-white">Interest Rate Model</div>
              <div className="h-px w-[260px] rounded-full bg-linear-to-l from-white/0 to-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex w-full justify-between px-8 pt-16">
              <div className="w-1/4">
                <div className="font-semibold text-lg text-purple">
                  Net Borrow APR
                </div>
                <div
                  className={cn(
                    isAprPending && 'animate-pulse',
                    'font-semibold text-white text-xl'
                  )}
                >
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger
                        onClick={(e: { preventDefault: () => any }) =>
                          e.preventDefault()
                        }
                      >
                        <div>
                          {aprData?.netBorrowApr.times(100).toFixed(2)}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        onPointerDownOutside={(e: {
                          preventDefault: () => any;
                        }) => e.preventDefault()}
                      >
                        <NetBorrowTooltip aprData={aprData} />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="mt-8 font-semibold text-lg text-primary">
                  Net Earn APR
                </div>
                <div
                  className={cn(
                    isAprPending && 'animate-pulse',
                    'font-semibold text-white text-xl'
                  )}
                >
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger
                        onClick={(e: { preventDefault: () => any }) =>
                          e.preventDefault()
                        }
                      >
                        <div>
                          {aprData?.netSupplyApr.times(100).toFixed(2)}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        onPointerDownOutside={(e: {
                          preventDefault: () => any;
                        }) => e.preventDefault()}
                      >
                        <NetEarnTooltip aprData={aprData} />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="w-3/4">
                <KinkChart marketName={baseAsset} />
              </div>
            </div>
          </CardContent>
        </Card>

        <MarketCollateralsTable marketName={baseAsset} />
      </div>
    </div>
  );
}
