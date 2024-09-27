'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  useBorrowRate,
  useCollateralConfigurations,
  useMarketBalanceOfBase,
  useMarketBasics,
  useMarketConfiguration,
  usePrice,
  useSupplyRate,
  useTotalCollateral,
  useTotalReserves,
} from '@/hooks';

import {
  type DeployedMarket,
  SYMBOL_TO_ICON,
  formatUnits,
  getBorrowApr,
  getFormattedNumber,
  getFormattedPrice,
  getSupplyApr,
} from '@/utils';
import BigNumber from 'bignumber.js';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useMemo } from 'react';
import { IconPair } from '../IconPair';
import { KinkChart } from './KinkChart';
import { MarketCollateralsTable } from './MarketCollateralsTable';

type MarketOverviewProps = {
  network: string;
  baseAsset: string;
  marketChartCollateral: React.ReactNode;
  marketChartBorrow: React.ReactNode;
};

export default function MarketOverview({
  network,
  baseAsset,
  marketChartCollateral,
  marketChartBorrow,
}: MarketOverviewProps) {
  const { data: borrowRate } = useBorrowRate(baseAsset as DeployedMarket);
  const { data: supplyRate } = useSupplyRate(baseAsset as DeployedMarket);
  const { data: totalReserves } = useTotalReserves(baseAsset as DeployedMarket);

  const { data: collateralConfigurations } = useCollateralConfigurations(
    baseAsset as DeployedMarket
  );
  const { data: marketConfiguration } = useMarketConfiguration(
    baseAsset as DeployedMarket
  );
  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);
  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);
  const availableLiquidity = useMarketBalanceOfBase(
    baseAsset as DeployedMarket
  );

  const { data: totalCollateral } = useTotalCollateral(
    baseAsset as DeployedMarket
  );
  const { data: marketBasics } = useMarketBasics(baseAsset as DeployedMarket);

  const { data: priceData } = usePrice(baseAsset as DeployedMarket);

  const totalCollateralValue = useMemo(() => {
    if (!priceData || !totalCollateral || !collateralConfigurations) {
      return BigNumber(0);
    }

    return Array.from(totalCollateral.entries()).reduce(
      (sum, [assetId, value]) => {
        if (!collateralConfigurations[assetId]) return sum;
        const assetPrice = priceData.prices[assetId] ?? BigNumber(0);
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
    if (!marketBasics || !marketConfiguration) {
      return BigNumber(0);
    }

    const totalEarning = formatUnits(
      BigNumber(marketBasics?.total_supply_base.toString()!),
      marketConfiguration?.baseTokenDecimals
    );

    const totalBorrowing = formatUnits(
      BigNumber(marketBasics?.total_borrow_base.toString()!),
      marketConfiguration?.baseTokenDecimals
    );

    return totalEarning.div(totalBorrowing).times(100);
  }, [marketConfiguration, marketBasics]);

  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col gap-y-8 w-full items-center justify-center">
      <div className="max-lg:hidden flex items-start justify-between w-full">
        <div className="flex items-center space-x-4 text-white/60 w-1/3">
          <Link href="/market">
            <div className="flex gap-x-2 items-center">
              <ChevronLeft className="h-6 w-6" />
              <div className="text-[20px] font-semibold">Markets</div>
            </div>
          </Link>
        </div>

        <div className="w-1/3 flex flex-col items-center justify-center">
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
            <span className="text-moon text-xl font-semibold ml-2">
              {network.toUpperCase()} Network
            </span>
            <span className="text-xl text-white font-semibold">
              {` · ${baseAsset}`}
            </span>
          </div>
        </div>
        <div className="w-1/3" />
      </div>

      <div className="w-full mt-12 flex justify-between">
        <div className="w-[47%]">
          <div className="max-lg:hidden">
            <div className="text-primary text-md font-semibold">
              Total Collateral
            </div>
            <div className="text-white font-bold text-[20px]">
              {getFormattedPrice(totalCollateralValue)}
            </div>
          </div>
          {marketChartCollateral}
        </div>

        <div className="w-[47%]">
          <div className="max-lg:hidden">
            <div className="text-purple text-md font-semibold">
              Total Borrowing
            </div>
            <div className="text-white font-bold text-[20px]">
              {getFormattedPrice(
                formatUnits(
                  BigNumber(marketBasics?.total_borrow_base.toString()!),
                  marketConfiguration?.baseTokenDecimals
                )
              )}
            </div>
          </div>
          {marketChartBorrow}
        </div>
      </div>

      <div className="max-lg:hidden flex flex-col gap-y-8 w-full items-center justify-center">
        <Card className="mt-8 w-full">
          <CardHeader className="bg-white/5">
            <div className="w-full items-center justify-center gap-x-2 font-semibold text-lg flex">
              <div className="w-[260px] rounded-full h-[1px] bg-gradient-to-r from-white/0 to-primary" />
              <div className="text-center text-white">Market Stats</div>
              <div className="w-[260px] rounded-full h-[1px] bg-gradient-to-l from-white/0 to-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex justify-evenly pt-[55px]">
            <div>
              <div className="text-sm text-primary font-semibold">
                Total Earning
              </div>
              <div className="text-xl font-semibold text-white mt-2">
                {getFormattedPrice(
                  formatUnits(
                    BigNumber(marketBasics?.total_supply_base.toString()!),
                    marketConfiguration?.baseTokenDecimals
                  )
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-primary font-semibold">
                Available Liquidity
              </div>
              <div className="text-xl font-semibold text-white mt-2">
                {getFormattedPrice(availableLiquidity.formatted)}
              </div>
            </div>
            <div>
              <div className="text-sm text-primary font-semibold">
                Total Reserves
              </div>
              <div className="text-xl font-semibold text-white mt-2">
                {getFormattedPrice(
                  formatUnits(
                    formatUnits(
                      totalReserves ?? BigNumber(0),
                      marketConfiguration?.baseTokenDecimals
                    )
                  )
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-primary font-semibold">
                Collateralization
              </div>
              <div className="text-xl font-semibold text-white mt-2">
                {collateralization.toFixed(2, 1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-primary font-semibold">
                Oracle Price
              </div>
              <div className="text-xl font-semibold text-white mt-2">
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
            <div className="w-full items-center justify-center gap-x-2 font-semibold text-lg flex">
              <div className="w-[260px] rounded-full h-[1px] bg-gradient-to-r from-white/0 to-primary" />
              <div className="text-center text-white">Interest Rate Model</div>
              <div className="w-[260px] rounded-full h-[1px] bg-gradient-to-l from-white/0 to-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full flex justify-between pt-16 px-8">
              <div className="w-1/4 ">
                <div className="text-purple text-lg font-semibold">
                  Net Borrow APR
                </div>
                <div className="text-xl text-white font-semibold">
                  {borrowApr}
                </div>

                <div className="text-primary text-lg font-semibold mt-8">
                  Net Earn APR
                </div>
                <div className="text-xl text-white font-semibold">
                  {supplyApr}
                </div>
              </div>
              <div className="w-3/4">
                <KinkChart marketName={baseAsset as DeployedMarket} />
              </div>
            </div>
          </CardContent>
        </Card>

        <MarketCollateralsTable marketName={baseAsset} />
      </div>
    </div>
  );
}
