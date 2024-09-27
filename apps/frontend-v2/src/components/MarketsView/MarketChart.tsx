'use client';

import type { ChartData } from '@/lib/charts';
import { getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';
import {
  Area,
  AreaChart,
  Rectangle,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import type { DataKey } from 'recharts/types/util/types';
import { type ChartConfig, ChartContainer, ChartTooltip } from '../ui/chart';

const chartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col gap-y-2 items-start p-2 bg-card/40 shadow-md rounded-lg">
        <div className="text-white text-md font-semibold">
          {getFormattedPrice(BigNumber(payload[0].value))}
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

export const MarketChart = ({
  chartData,
  dataKey,
  color,
}: {
  chartData: ChartData[] | undefined;
  dataKey: string | undefined;
  color: string | undefined;
}) => {
  if (!chartData || !color) return null;

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ChartContainer config={chartConfig}>
        <AreaChart
          className="max-lg:hidden"
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <XAxis
            dataKey="timestamp"
            tickLine={true}
            axisLine={true}
            tickMargin={12}
            minTickGap={30}
            tickFormatter={(value: number) =>
              dateFormatter.format(new Date(value * 1000))
            }
            style={{
              fill: '#FFFFFF',
              opacity: 0.6,
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: '400',
            }}
            stroke="#FFFFFF"
          />
          <ChartTooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
          <defs>
            <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={'#3FE8BD'} stopOpacity={0.2} />
              <stop offset="50%" stopColor={'#3FE8BD'} stopOpacity={0.1} />
              <stop offset="70%" stopColor={'#3FE8BD'} stopOpacity={0.03} />
              <stop offset="90%" stopColor={'#3FE8BD'} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={'#8B5CF6'} stopOpacity={0.2} />
              <stop offset="50%" stopColor={'#8B5CF6'} stopOpacity={0.1} />
              <stop offset="70%" stopColor={'#8B5CF6'} stopOpacity={0.03} />
              <stop offset="90%" stopColor={'#8B5CF6'} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="color4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <Area
            dataKey={dataKey as DataKey<string>}
            type="natural"
            fill={`url(#${color === '#3FE8BD' ? 'color1' : 'color2'})`}
            fillOpacity={1}
            strokeWidth={3}
            stroke={color}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};
