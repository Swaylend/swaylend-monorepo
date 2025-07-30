'use client';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
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

type Row = {
  timestamp: number;
  suppliedValueUsd: number;
  borrowedValueUsd: number;
  collateralValueUsd: number;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-white/20 bg-card/80 p-4 shadow-md">
        <div className="flex justify-between gap-x-4 font-semibold text-sm">
          <div>Total Supply</div>
          <div>
            {getFormattedPrice(
              BigNumber(payload[0].value).plus(payload[2].value)
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-[#3FE8BD]" />
            <div className="font-normal text-white/60 text-xs">Earning</div>
          </div>
          <div>{getFormattedPrice(BigNumber(payload[0].value))}</div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-[#8B5CF6]" />
            <div className="font-normal text-white/60 text-xs">Borrowing</div>
          </div>
          <div>{getFormattedPrice(BigNumber(payload[1].value))}</div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-[#918E8E]" />
            <div className="font-normal text-white/60 text-xs">Collateral</div>
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
        className={className}
        fillOpacity={0}
        height={height}
        pointerEvents={pointerEvents}
        points={points}
        stroke="#FFFFFF"
        strokeOpacity={0.4}
        type="linear"
        width={0.5}
        x={x - 0.5}
        y={y}
      />
      <Rectangle
        className={className}
        fillOpacity={0.4}
        height={height}
        pointerEvents={pointerEvents}
        points={points}
        style={{
          fill: 'url(#color4)',
        }}
        type="linear"
        width={20}
        x={x - 10}
        y={y}
      />
    </>
  );
}

export const UserHistoryChart = ({
  chartData,
  lastRow,
}: {
  chartData: Row[] | undefined;
  lastRow: any | undefined;
}) => {
  const updatedChartData = useMemo(() => {
    if (!(lastRow && chartData) || chartData.length === 0) return chartData;

    const {
      collateralAmountUsd: collateralValueUsd,
      suppliedAmountUsd: suppliedValueUsd,
      borrowedAmountUsd: borrowedValueUsd,
    } = lastRow;

    const newChartData = [...chartData];
    newChartData[newChartData.length - 1] = {
      timestamp: newChartData.at(-1)?.timestamp ?? 0,
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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full py-4 text-center">No chart data available</div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            className="max-lg:hidden"
            data={updatedChartData}
            margin={{
              left: 16,
              right: 16,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid opacity={0.2} stroke="#ffffff" vertical={false} />
            <XAxis
              axisLine={true}
              dataKey="timestamp"
              minTickGap={30}
              padding={{ left: 10, right: 10 }}
              stroke="#FFFFFF"
              style={{
                fill: '#FFFFFF',
                opacity: 0.6,
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '400',
              }}
              tickFormatter={(value: number) => {
                return dateFormatter.format(new Date(value * 1000));
              }}
              tickLine={true}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              style={{
                fill: '#FFFFFF',
                opacity: 0.6,
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '400',
              }}
              tickFormatter={(value: number) => {
                return `${getFormattedPrice(BigNumber(value))}`;
              }}
              tickLine={false}
            />
            <ChartTooltip
              content={<CustomTooltip />}
              cursor={<CustomCursor />}
            />
            <defs>
              <linearGradient id="color2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3FE8BD" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3FE8BD" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color3" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#918E8E" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#918E8E" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="color4" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <Area
              dataKey="suppliedValueUsd"
              fill="url(#color1)"
              fillOpacity={0.4}
              stackId="1"
              stroke="#3FE8BD"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="borrowedValueUsd"
              fill="url(#color2)"
              fillOpacity={0.4}
              stackId="2"
              stroke="#8B5CF6"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="collateralValueUsd"
              fill="url(#color3)"
              fillOpacity={0.4}
              stackId="3"
              stroke="#918E8E"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};
