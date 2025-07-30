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
import { getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

type Row = {
  timestamp: number;
  suppliedValueUsd: number;
  borrowedValueUsd: number;
  collateralValueUsd: number;
};

export const UserHistoryChart = ({
  chartData,
  lastRow,
}: {
  chartData: Row[] | undefined;
  lastRow: any | undefined;
}) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full text-center py-4">No chart data available</div>
    );
  }

  const updatedChartData = useMemo(() => {
    if (!lastRow || chartData.length === 0) return chartData;

    const {
      collateralAmountUsd: collateralValueUsd,
      suppliedAmountUsd: suppliedValueUsd,
      borrowedAmountUsd: borrowedValueUsd,
    } = lastRow;

    const newChartData = [...chartData];
    newChartData[newChartData.length - 1] = {
      timestamp: newChartData[newChartData.length - 1].timestamp,
      suppliedValueUsd,
      borrowedValueUsd,
      collateralValueUsd,
    };

    return newChartData;
  }, [lastRow, chartData]);

  const chartConfig = {
    suppliedValueUsd: {
      label: 'Earning',
      color: '#8B5CF6', // Match the gradient color
    },
    borrowedValueUsd: {
      label: 'Borrowing',
      color: '#3FE8BD', // Match the gradient color
    },
    collateralValueUsd: {
      label: 'Collateral',
      color: '#918E8E',
    },
  } satisfies ChartConfig;

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/80 p-4 rounded-md border border-white/20 shadow-md">
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
              <div className="w-2 h-2 rounded-full bg-[#3FE8BD]" />
              <div className="text-white/60 text-xs font-normal">Earning</div>
            </div>
            <div>{getFormattedPrice(BigNumber(payload[0].value))}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
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
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <AreaChart
            className="max-lg:hidden"
            accessibilityLayer
            data={updatedChartData}
            margin={{
              left: 16,
              right: 16,
              top: 10,
              bottom: 10,
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
              <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
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
              stroke="#3FE8BD"
              strokeWidth={2}
              stackId="1"
            />
            <Area
              dataKey="borrowedValueUsd"
              type="monotone"
              fill="url(#color2)"
              fillOpacity={0.4}
              strokeWidth={2}
              stroke="#8B5CF6"
              stackId="2"
            />
            <Area
              dataKey="collateralValueUsd"
              type="monotone"
              fill="url(#color3)"
              fillOpacity={0.4}
              strokeWidth={2}
              stroke="#918E8E"
              stackId="3"
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};
