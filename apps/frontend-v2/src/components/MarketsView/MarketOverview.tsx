'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
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
  getSupplyApr,
} from '@/utils';
import { formatCurrency } from '@/utils/format';
import BigNumber from 'bignumber.js';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Rectangle,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import { IconPair } from '../IconPair';
import { KinkChart } from './KinkChart';
import { MarketCollateralsTable } from './MarketCollateralsTable';

type MarketOverviewProps = {
  network: string;
  baseAsset: string;
};

export default function MarketOverview({
  network,
  baseAsset,
}: MarketOverviewProps) {
  // Tmp data
  const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ];

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

  const totalCollateralValue = useMemo(() => {
    if (!priceData || !totalCollateral || !collateralConfigurations) {
      return BigNumber(0);
    }

    return Array.from(totalCollateral.entries()).reduce(
      (sum, [assetId, value]) => {
        if (!collateralConfigurations[assetId]) return sum;
        const assetPrice = priceData.prices[assetId] ?? BigNumber(0);
        return sum.plus(assetPrice.times(value));
      },
      BigNumber(0)
    );
  }, [totalCollateral, priceData]);

  const formattedTotalCollateral = formatUnits(
    totalCollateralValue,
    marketConfiguration?.baseTokenDecimals
  );

  const collateralization = useMemo(() => {
    if (!totalCollateralValue || !marketBasics) {
      return BigNumber(0);
    }

    return formattedTotalCollateral
      .minus(
        formatUnits(
          BigNumber(marketBasics?.total_borrow_base.toString()),
          marketConfiguration?.baseTokenDecimals
        )
      )
      .div(BigNumber(100));
  }, [totalCollateralValue, marketBasics]);

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="flex flex-col gap-y-2 items-start p-2 bg-card/40 shadow-md rounded-lg">
          <div className="text-white text-md font-semibold">
            ${payload[0].value}
          </div>
          <div className="text-moon text-sm font-semibold">Earn APR</div>
          <div className="text-white text-md font-semibold">5.17%</div>
        </div>
      );
    }

    return null;
  };

  function CustomCursor(props: any) {
    const { stroke, pointerEvents, height, points, className } = props;

    const { x, y } = points[0];
    return (
      <>
        <Rectangle
          x={x - 0.5}
          y={y}
          fillOpacity={0}
          stroke="#FFFFFF"
          strokeOpacity={0.4}
          pointerEvents={pointerEvents}
          width={0.5}
          height={height}
          points={points}
          className={className}
          type="linear"
        />
        <Rectangle
          x={x - 23}
          y={y}
          fillOpacity={0.4}
          style={{
            fill: 'url(#color4)',
          }}
          pointerEvents={pointerEvents}
          width={46}
          height={height}
          points={points}
          className={className}
          type="linear"
        />
      </>
    );
  }

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
              ${formatCurrency(Number(formattedTotalCollateral))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <XAxis
                  dataKey="month"
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                  // tick={<CustomTick />}
                  style={{
                    fill: '#FFFFFF',
                    opacity: 0.6,
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '400',
                  }}
                  stroke="#FFFFFF"
                />
                <ChartTooltip
                  content={<CustomTooltip />}
                  cursor={<CustomCursor />}
                />
                <defs>
                  <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3FE8BD" stopOpacity={0.2} />
                    <stop offset="50%" stopColor="#3FE8BD" stopOpacity={0.1} />
                    <stop offset="70%" stopColor="#3FE8BD" stopOpacity={0.03} />
                    <stop offset="90%" stopColor="#3FE8BD" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="color4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
                    <stop
                      offset="100%"
                      stopColor="#FFFFFF"
                      stopOpacity={0.35}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="url(#color1)"
                  fillOpacity={1}
                  strokeWidth={3}
                  stroke="#3FE8BD"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={200}>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <XAxis
                  dataKey="month"
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                  // tick={<CustomTick />}
                  style={{
                    fill: '#FFFFFF',
                    opacity: 0.6,
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '400',
                  }}
                  stroke="#FFFFFF"
                />
                <ChartTooltip
                  content={<CustomTooltip />}
                  cursor={<CustomCursor />}
                />
                <defs>
                  <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    <stop offset="70%" stopColor="#8b5cf6" stopOpacity={0.03} />
                    <stop offset="90%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="color4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
                    <stop
                      offset="100%"
                      stopColor="#FFFFFF"
                      stopOpacity={0.35}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="url(#color2)"
                  fillOpacity={1}
                  strokeWidth={3}
                  stroke="#8b5cf6"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </ResponsiveContainer>
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
                Number(priceData!.prices[marketConfiguration?.baseToken!])
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
