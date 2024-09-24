import React from 'react';
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
import type { ChartData } from '@/hooks/useChartsData';
import { formatCurrency, removeDuplicatesByProperty } from '@/utils/format';

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/80 p-4 rounded-md border-[1px] border-white/20 shadow-md">
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="text-white/60 text-xs font-normal">Earning</div>
            </div>
            <div>${formatCurrency(payload[0].value)}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
              <div className="text-white/60 text-xs font-normal">
                Collateral
              </div>
            </div>
            <div>${formatCurrency(payload[2].value)}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-purple" />
              <div className="text-white/60 text-xs font-normal">Borrowing</div>
            </div>
            <div>${formatCurrency(payload[1].value)}</div>
          </div>
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
    <ResponsiveContainer width="100%">
      {chartData ? (
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={removeDuplicatesByProperty(chartData, 'timestamp')}
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
              tickFormatter={(value: number) => {
                return new Date(value * 1000).toDateString();
              }}
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
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => {
                return `$${formatCurrency(value)}`;
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
              type="natural"
              fill="url(#color2)"
              fillOpacity={0.4}
              stroke="url(#color2)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="borrowedValueUsd"
              type="natural"
              fill="url(#color1)"
              fillOpacity={0.4}
              strokeWidth={2}
              stroke="url(#color1)"
              stackId="b"
            />
            <Area
              dataKey="collateralValueUsd"
              type="natural"
              fill="url(#color3)"
              fillOpacity={0.4}
              strokeWidth={2}
              stroke="url(#color3)"
              stackId="c"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div>Loading...</div>
      )}
    </ResponsiveContainer>
  );
};
