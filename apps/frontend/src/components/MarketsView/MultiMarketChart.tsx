'use client';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import type { ChartData } from '@/lib/charts';
import { getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';

export const MultiMarketChart = ({
  chartData,
}: {
  chartData: ChartData[] | undefined;
}) => {
  if (!chartData) return null;

  const chartConfig = {
    suppliedValueUsd: {
      label: 'Earning',
      color: 'hsl(var(--primary))',
    },
    borrowedValueUsd: {
      label: 'Borrowing',
      color: '#918E8E',
    },
    collateralValueUsd: {
      label: 'Collateral',
      color: '#8B5CF6',
    },
  } satisfies ChartConfig;

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/80 p-4 rounded-md border-[1px] border-white/20 shadow-md">
          <div className="flex justify-between text-sm gap-x-4 font-semibold">
            <div>Total Supply</div>
            <div>
              {getFormattedPrice(
                BigNumber(payload[0].value).plus(payload[2].value)
              )}
            </div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-purple" />
              <div className="text-white/60 text-xs font-normal">Earning</div>
            </div>
            <div>{getFormattedPrice(BigNumber(payload[0].value))}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="text-white/60 text-xs font-normal">Borrowing</div>
            </div>
            <div>{getFormattedPrice(BigNumber(payload[1].value))}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
              <div className="text-white/60 text-xs font-normal">
                Collateral
              </div>
            </div>
            <div>{getFormattedPrice(BigNumber(payload[2].value))}</div>
          </div>
        </div>
      );
    }

    return null;
  };

  function CustomCursor(props: any) {
    const { pointerEvents, height, points, className } = props;

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
          x={x - 10}
          y={y}
          fillOpacity={0.4}
          style={{
            fill: 'url(#color4)',
          }}
          pointerEvents={pointerEvents}
          width={20}
          height={height}
          points={points}
          className={className}
          type="linear"
        />
      </>
    );
  }

  return (
    <ResponsiveContainer width="100%">
      {chartData ? (
        <ChartContainer config={chartConfig}>
          <AreaChart
            className="max-lg:hidden"
            accessibilityLayer
            data={chartData}
            margin={{
              left: 16,
              right: 16,
            }}
          >
            <CartesianGrid vertical={false} stroke="#ffffff" opacity={0.2} />
            <XAxis
              dataKey="timestamp"
              tickLine={true}
              axisLine={true}
              tickMargin={10}
              minTickGap={30}
              padding={{ left: 10, right: 10 }}
              interval="preserveStartEnd"
              tickFormatter={(value: number) => {
                return dateFormatter.format(new Date(value * 1000));
              }}
              style={{
                fill: '#FFFFFF',
                opacity: 0.6,
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '400',
              }}
              stroke="#FFFFFF"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => {
                return `${getFormattedPrice(BigNumber(value))}`;
              }}
              style={{
                fill: '#FFFFFF',
                opacity: 0.6,
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '400',
              }}
            />
            <ChartTooltip
              content={<CustomTooltip />}
              cursor={<CustomCursor />}
            />
            <defs>
              <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3FE8BD" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3FE8BD" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#918E8E" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#918E8E" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <Area
              dataKey="suppliedValueUsd"
              type="monotone"
              fill="url(#color1)"
              fillOpacity={0.4}
              stroke="url(#color1)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="borrowedValueUsd"
              type="monotone"
              fill="url(#color2)"
              fillOpacity={0.4}
              strokeWidth={2}
              stroke="url(#color2)"
              stackId="b"
            />
            <Area
              dataKey="collateralValueUsd"
              type="monotone"
              fill="url(#color3)"
              fillOpacity={0.4}
              strokeWidth={2}
              stroke="url(#color3)"
              stackId="c"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="max-md:hidden">Loading...</div>
      )}
    </ResponsiveContainer>
  );
};
