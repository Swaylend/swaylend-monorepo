'use client';
import React from 'react';
import { ArrowLeft, ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import { MarketCollateralsTable } from './MarketCollateralsTable';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import Link from 'next/link';
import { IconPair } from '../IconPair';
import { SYMBOL_TO_ICON } from '@/utils';

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

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
    mobile: {
      label: 'Mobile',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <div className="pt-[60px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center space-x-4 text-white/40 w-1/3">
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
                id: 'usdc',
                name: 'USDC',
                path: SYMBOL_TO_ICON.USDC,
              },
              {
                id: 'fuel',
                name: 'Fuel',
                path: SYMBOL_TO_ICON.ETH,
              },
            ]}
          />
          <div className="mt-[36px]">
            <span className="text-xl text-white font-semibold">USDC</span>
            <span className="text-moon text-xl font-semibold ml-2">
              · Fuel Network
            </span>
          </div>
        </div>
        <div className="w-1/3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-[125px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-400">Total Collateral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$93.09M</div>
            <div className="text-sm text-gray-400">7 day APR: 5.66%</div>
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
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-400">Total Borrowing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$93.09M</div>
            <div className="text-sm text-gray-400">Borrow APR: 6.66%</div>
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
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Market Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <div className="text-sm text-gray-400">Total Earning</div>
            <div className="text-xl font-bold">$456.05M</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Available Liquidity</div>
            <div className="text-xl font-bold">$147.37M</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Reserves</div>
            <div className="text-xl font-bold">$9.77M</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Collateralization</div>
            <div className="text-xl font-bold">143.21%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Oracle Price</div>
            <div className="text-xl font-bold">$1.00</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Net Borrow APR</span>
                <span className="font-bold">2.37%</span>
              </div>
              <Progress value={30} className="h-2 bg-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Net Supply APR</span>
                <span className="font-bold">5.67%</span>
              </div>
              <Progress value={70} className="h-2 bg-gray-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interest Rate Model</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Collateral Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer>
            <MarketCollateralsTable />
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between gap-4">
            <Button
              variant="outline"
              className="text-gray-400 w-full sm:w-auto"
            >
              Etherscan <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="text-gray-400 w-full sm:w-auto"
            >
              Gauntlet <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="text-gray-400 w-full sm:w-auto"
            >
              Risk Analysis <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="text-gray-400 w-full sm:w-auto"
            >
              Chaos Labs <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
