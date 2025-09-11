'use client';

import BigNumber from 'bignumber.js';
import { Area, AreaChart, Rectangle, XAxis } from 'recharts';
import type { DataKey } from 'recharts/types/util/types';
import type { ChartData } from '@/lib/charts/v2';
import { getFormattedPrice } from '@/utils';
import { type ChartConfig, ChartContainer, ChartTooltip } from '../../ui/chart';

const chartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col items-start gap-y-2 rounded-lg bg-card/40 p-2 shadow-md">
        <div className="font-semibold text-md text-white">
          {getFormattedPrice(BigNumber(payload[0].value))}
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

export const MarketChart = ({
  chartData,
  dataKey,
  color,
}: {
  chartData: ChartData[] | undefined;
  dataKey: string | undefined;
  color: string | undefined;
}) => {
  if (!(chartData && color)) return null;

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <ChartContainer
      className="h-[200px] min-h-[200px] w-full"
      config={chartConfig}
    >
      <AreaChart
        accessibilityLayer
        className="max-lg:hidden"
        data={chartData}
        margin={{
          left: 16,
          right: 16,
        }}
      >
        <XAxis
          axisLine={true}
          dataKey="timestamp"
          interval="preserveStartEnd"
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
          tickFormatter={(value: number) =>
            dateFormatter.format(new Date(value * 1000))
          }
          tickLine={true}
          tickMargin={12}
        />
        <ChartTooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
        <defs>
          <linearGradient id="color1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={'#3FE8BD'} stopOpacity={0.2} />
            <stop offset="50%" stopColor={'#3FE8BD'} stopOpacity={0.1} />
            <stop offset="70%" stopColor={'#3FE8BD'} stopOpacity={0.03} />
            <stop offset="90%" stopColor={'#3FE8BD'} stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="color2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={'#8B5CF6'} stopOpacity={0.2} />
            <stop offset="50%" stopColor={'#8B5CF6'} stopOpacity={0.1} />
            <stop offset="70%" stopColor={'#8B5CF6'} stopOpacity={0.03} />
            <stop offset="90%" stopColor={'#8B5CF6'} stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="color4" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <Area
          dataKey={dataKey as DataKey<string>}
          fill={`url(#${color === '#3FE8BD' ? 'color1' : 'color2'})`}
          fillOpacity={1}
          stackId="a"
          stroke={color}
          strokeWidth={3}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
};
