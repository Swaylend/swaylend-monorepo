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
import { type ChartData, useChartsData } from '@/hooks/useChartsData';
import {
  type DeployedMarket,
  SYMBOL_TO_ICON,
  formatUnits,
  getBorrowApr,
  getSupplyApr,
} from '@/utils';
import { formatCurrency } from '@/utils/format';
import BigNumber from 'bignumber.js';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { IconPair } from '../IconPair';
import { KinkChart } from './KinkChart';
import { MarketChart } from './MarketChart';
import { MarketCollateralsTable } from './MarketCollateralsTable';

type MarketOverviewProps = {
  network: string;
  baseAsset: string;
};

export default function MarketOverview({
  network,
  baseAsset,
}: MarketOverviewProps) {
  const { data: borrowRate } = useBorrowRate(baseAsset as DeployedMarket);
  const { data: supplyRate } = useSupplyRate(baseAsset as DeployedMarket);
  const { data: totalReserves } = useTotalReserves(baseAsset as DeployedMarket);

  const { data: collateralConfigurations } = useCollateralConfigurations();
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

  const { data: chartsData } = useChartsData();

  const totalCollateralValue = useMemo(() => {
    if (!priceData || !totalCollateral || !collateralConfigurations) {
      return BigNumber(0);
    }

    return Array.from(totalCollateral.entries()).reduce(
      (sum, [assetId, value]) => {
        if (!collateralConfigurations[assetId]) return sum;
        const assetPrice = priceData.prices[assetId] ?? BigNumber(0);
        return sum.plus(
          assetPrice.times(
            value.div(
              BigNumber(10).pow(collateralConfigurations[assetId].decimals)
            )
          )
        );
      },
      BigNumber(0)
    );
  }, [totalCollateral, priceData]);

  const collateralization = useMemo(() => {
    if (!totalCollateralValue || !marketBasics) {
      return BigNumber(0);
    }

    return totalCollateralValue
      .minus(
        formatUnits(
          BigNumber(marketBasics?.total_borrow_base.toString()),
          marketConfiguration?.baseTokenDecimals
        )
      )
      .div(BigNumber(100));
  }, [totalCollateralValue, marketBasics]);

  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <div className="flex items-start justify-between w-full">
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
          <div className="mt-[36px]">
            <span className="text-moon text-xl font-semibold ml-2">
              Fuel Network
            </span>
            <span className="text-xl text-white font-semibold">
              {` · ${baseAsset}`}
            </span>
          </div>
        </div>
        <div className="w-1/3" />
      </div>

      <div className="w-full flex justify-between mt-[55px]">
        <div className="w-[47%]">
          <div>
            <div className="text-primary text-md font-semibold">
              Total Collateral
            </div>
            <div className="text-white font-bold text-[20px]">
              ${formatCurrency(Number(totalCollateralValue))}
            </div>
          </div>
          <MarketChart
            chartData={chartsData?.[baseAsset].sort(
              (a, b) => a.timestamp - b.timestamp
            )}
            dataKey="collateralValueUsd"
            color="#3FE8BD"
          />
        </div>

        <div className="w-[47%]">
          <div>
            <div className="text-purple text-md font-semibold">
              Total Borrowing
            </div>
            <div className="text-white font-bold text-[20px]">
              $
              {formatCurrency(
                Number(
                  formatUnits(
                    BigNumber(marketBasics?.total_borrow_base.toString()!),
                    marketConfiguration?.baseTokenDecimals
                  )
                )
              )}
            </div>
          </div>
          <MarketChart
            chartData={chartsData?.[baseAsset].sort(
              (a, b) => a.timestamp - b.timestamp
            )}
            dataKey="borrowedValueUsd"
            color="#8b5cf6"
          />
        </div>
      </div>

      <Card className="mt-[125px] w-full">
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
              $
              {formatCurrency(
                Number(
                  formatUnits(
                    BigNumber(marketBasics?.total_supply_base.toString()!),
                    marketConfiguration?.baseTokenDecimals
                  )
                )
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-primary font-semibold">
              Available Liquidity
            </div>
            <div className="text-xl font-semibold text-white mt-2">
              ${formatCurrency(Number(availableLiquidity.formatted))}
            </div>
          </div>
          <div>
            <div className="text-sm text-primary font-semibold">
              Total Reserves
            </div>
            <div className="text-xl font-semibold text-white mt-2">
              $
              {formatCurrency(
                Number(
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
              {formatCurrency(Number(collateralization))}%
            </div>
          </div>
          <div>
            <div className="text-sm text-primary font-semibold">
              Oracle Price
            </div>
            <div className="text-xl font-semibold text-white mt-2">
              $
              {formatCurrency(
                Number(priceData?.prices[marketConfiguration?.baseToken!])
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full mt-[55px]">
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
              <KinkChart marketName={baseAsset} />
            </div>
          </div>
        </CardContent>
      </Card>

      <MarketCollateralsTable marketName={baseAsset} />
    </div>
  );
}
