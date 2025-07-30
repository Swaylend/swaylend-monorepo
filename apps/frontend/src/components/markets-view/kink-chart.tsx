'use client';

import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import {
  useCreateChartData,
  useMarketConfiguration,
  useUtilization,
} from '@/hooks/v1';
import { formatUnits, getFormattedNumber } from '@/utils';
import { Skeleton } from '../ui/skeleton';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col items-start gap-y-2 p-2">
        <div className="flex items-center gap-x-2">
          <div className="font-semibold text-md text-moon">Utilization</div>
          <div className="font-semibold text-md text-white">{label}%</div>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="font-semibold text-md text-moon">Borrow APR</div>
          <div className="font-semibold text-md text-white">
            {payload[0].value}%
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="font-semibold text-md text-moon">Earn APR</div>
          <div className="font-semibold text-md text-white">
            {payload[1].value}%
          </div>
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
  );
}

export const KinkChart = ({ marketName }: { marketName: string }) => {
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: rateData } = useCreateChartData(
    marketName,
    marketConfiguration
  );
  const { data: utilization } = useUtilization(marketName);

  const currentUtilization = useMemo(() => {
    if (!utilization) return 0;

    return formatUnits(BigNumber(utilization?.toString()), 18)
      .times(100)
      .toNumber();
  }, [utilization]);

  const utilizationPosition =
    currentUtilization < 1 ? 1 : Number(currentUtilization.toFixed(0));

  return (
    <div className="w-full">
      {rateData ? (
        <ResponsiveContainer height={200} width="100%">
          <ChartContainer config={chartConfig}>
            <LineChart
              data={rateData}
              height={300}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              width={500}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="percent" tick={false} />
              <ChartTooltip
                content={<CustomTooltip />}
                cursor={<CustomCursor />}
                position={{ y: 16 }}
              />
              <ReferenceLine
                label={{
                  value: 'Current Utilization',
                  position: 'insideTopLeft',
                  fill: '#3FE8BD',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                }}
                stroke="#3FE8BD"
                strokeWidth={2}
                x={utilizationPosition}
              />
              <Line
                dataKey="borrowValue"
                dot={false}
                stroke="#3FE8BD"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="earn"
                dot={false}
                stroke="#8b5cf6"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer height={200} width="100%">
          <Skeleton className="mb-4 h-5/6 w-full rounded-md bg-primary/20" />
        </ResponsiveContainer>
      )}
      <div className="-mt-4 relative flex w-full justify-between px-6 text-white/60">
        <div>0%</div>
        <div>100%</div>
        <div
          className={
            'absolute top-0 left-[calc(50%-60px)] flex w-[120px] gap-x-2'
          }
        >
          <span className="font-medium text-moon">Utilization</span>
          <span className="font-semibold text-white">
            {getFormattedNumber(BigNumber(currentUtilization))}%
          </span>
        </div>
      </div>
    </div>
  );
};
