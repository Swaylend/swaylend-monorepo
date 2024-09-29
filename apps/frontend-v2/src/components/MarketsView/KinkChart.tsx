'use client';

import React, { useMemo } from 'react';
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
import { useMarketConfiguration, useUtilization } from '@/hooks';
import { useCreateChartData } from '@/hooks/useCreateChartData';
import { type DeployedMarket, formatUnits, getFormattedNumber } from '@/utils';
import BigNumber from 'bignumber.js';
import { Skeleton } from '../ui/skeleton';

export const KinkChart = ({
  marketName,
}: {
  marketName: DeployedMarket;
}) => {
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: rateData } = useCreateChartData(
    marketName as DeployedMarket,
    marketConfiguration
  );
  const { data: utilization } = useUtilization(marketName as DeployedMarket);

  const currentUtilization = useMemo(() => {
    if (!utilization) return 0;

    return formatUnits(BigNumber(utilization?.toString()), 18)
      .times(100)
      .toNumber();
  }, [utilization]);

  const utilizationPosition =
    currentUtilization < 1 ? 1 : Number(currentUtilization.toFixed(0));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="flex flex-col gap-y-2 items-start p-2">
          <div className="flex items-center gap-x-2">
            <div className="text-moon text-md font-semibold">Utilization</div>
            <div className="text-white text-md font-semibold">{label}%</div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="text-moon text-md font-semibold">Borrow APR</div>
            <div className="text-white text-md font-semibold">
              {payload[0].value}%
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="text-moon text-md font-semibold">Earn APR</div>
            <div className="text-white text-md font-semibold">
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
      </>
    );
  }

  return (
    <div className="w-full">
      {rateData ? (
        <ResponsiveContainer width="100%" height={200}>
          <ChartContainer config={chartConfig}>
            <LineChart
              width={500}
              height={300}
              data={rateData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="percent" tick={false} />
              <ChartTooltip
                content={<CustomTooltip />}
                cursor={<CustomCursor />}
                position={{ y: 16 }}
              />
              <ReferenceLine
                x={utilizationPosition}
                isFront
                stroke="#3FE8BD"
                strokeWidth={2}
                label={{
                  value: 'Current Utilization',
                  position: 'insideTopLeft',
                  fill: '#3FE8BD',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                }}
              />
              <Line
                type="monotone"
                dataKey="borrowValue"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="earn"
                stroke="#3FE8BD"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <Skeleton className="w-full h-5/6 bg-primary/20 rounded-md mb-4" />
        </ResponsiveContainer>
      )}
      <div className="w-full relative flex justify-between px-6 -mt-4 text-white/60">
        <div>0%</div>
        <div>100%</div>
        <div
          className={
            'w-[120px] flex gap-x-2 absolute left-[calc(50%-60px)] top-0'
          }
        >
          <span className="text-moon font-medium">Utilization</span>
          <span className="text-white font-semibold">
            {getFormattedNumber(BigNumber(currentUtilization))}%
          </span>
        </div>
      </div>
    </div>
  );
};
