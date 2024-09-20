import React from 'react';
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
  Rectangle,
  ReferenceLine,
} from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const kinkData = [
  { percent: 1, borrowValue: 1.54, earn: 0.04 },
  { percent: 2, borrowValue: 1.57, earn: 0.07 },
  { percent: 3, borrowValue: 1.6, earn: 0.1 },
  { percent: 4, borrowValue: 1.63, earn: 0.13 },
  { percent: 5, borrowValue: 1.66, earn: 0.16 },
  { percent: 6, borrowValue: 1.69, earn: 0.19 },
  { percent: 7, borrowValue: 1.72, earn: 0.22 },
  { percent: 8, borrowValue: 1.75, earn: 0.25 },
  { percent: 9, borrowValue: 1.78, earn: 0.28 },
  { percent: 10, borrowValue: 1.81, earn: 0.31 },
  { percent: 11, borrowValue: 1.84, earn: 0.34 },
  { percent: 12, borrowValue: 1.87, earn: 0.37 },
  { percent: 13, borrowValue: 1.9, earn: 0.4 },
  { percent: 14, borrowValue: 1.93, earn: 0.43 },
  { percent: 15, borrowValue: 1.96, earn: 0.46 },
  { percent: 16, borrowValue: 1.99, earn: 0.49 },
  { percent: 17, borrowValue: 2.02, earn: 0.52 },
  { percent: 18, borrowValue: 2.05, earn: 0.55 },
  { percent: 19, borrowValue: 2.08, earn: 0.58 },
  { percent: 20, borrowValue: 2.11, earn: 0.61 },
  { percent: 21, borrowValue: 2.14, earn: 0.64 },
  { percent: 22, borrowValue: 2.17, earn: 0.67 },
  { percent: 23, borrowValue: 2.2, earn: 0.7 },
  { percent: 24, borrowValue: 2.23, earn: 0.73 },
  { percent: 25, borrowValue: 2.26, earn: 0.76 },
  { percent: 26, borrowValue: 2.29, earn: 0.79 },
  { percent: 27, borrowValue: 2.32, earn: 0.82 },
  { percent: 28, borrowValue: 2.35, earn: 0.85 },
  { percent: 29, borrowValue: 2.38, earn: 0.88 },
  { percent: 30, borrowValue: 2.41, earn: 0.91 },
  { percent: 31, borrowValue: 2.44, earn: 0.94 },
  { percent: 32, borrowValue: 2.47, earn: 0.97 },
  { percent: 33, borrowValue: 2.5, earn: 1.0 },
  { percent: 34, borrowValue: 2.53, earn: 1.03 },
  { percent: 35, borrowValue: 2.56, earn: 1.06 },
  { percent: 36, borrowValue: 2.59, earn: 1.09 },
  { percent: 37, borrowValue: 2.62, earn: 1.12 },
  { percent: 38, borrowValue: 2.65, earn: 1.15 },
  { percent: 39, borrowValue: 2.68, earn: 1.18 },
  { percent: 40, borrowValue: 2.71, earn: 1.21 },
  { percent: 41, borrowValue: 2.74, earn: 1.24 },
  { percent: 42, borrowValue: 2.77, earn: 1.27 },
  { percent: 43, borrowValue: 2.8, earn: 1.3 },
  { percent: 44, borrowValue: 2.83, earn: 1.33 },
  { percent: 45, borrowValue: 2.86, earn: 1.36 },
  { percent: 46, borrowValue: 2.89, earn: 1.39 },
  { percent: 47, borrowValue: 2.92, earn: 1.42 },
  { percent: 48, borrowValue: 2.95, earn: 1.45 },
  { percent: 49, borrowValue: 2.98, earn: 1.48 },
  { percent: 50, borrowValue: 3.01, earn: 1.51 },
  { percent: 51, borrowValue: 3.04, earn: 1.54 },
  { percent: 52, borrowValue: 3.07, earn: 1.57 },
  { percent: 53, borrowValue: 3.1, earn: 1.6 },
  { percent: 54, borrowValue: 3.13, earn: 1.63 },
  { percent: 55, borrowValue: 3.16, earn: 1.66 },
  { percent: 56, borrowValue: 3.19, earn: 1.69 },
  { percent: 57, borrowValue: 3.22, earn: 1.72 },
  { percent: 58, borrowValue: 3.25, earn: 1.75 },
  { percent: 59, borrowValue: 3.28, earn: 1.78 },
  { percent: 60, borrowValue: 3.31, earn: 1.81 },
  { percent: 61, borrowValue: 3.34, earn: 1.84 },
  { percent: 62, borrowValue: 3.37, earn: 1.87 },
  { percent: 63, borrowValue: 3.4, earn: 1.9 },
  { percent: 64, borrowValue: 3.43, earn: 1.93 },
  { percent: 65, borrowValue: 3.46, earn: 1.96 },
  { percent: 66, borrowValue: 3.49, earn: 1.99 },
  { percent: 67, borrowValue: 3.52, earn: 2.02 },
  { percent: 68, borrowValue: 3.55, earn: 2.05 },
  { percent: 69, borrowValue: 3.58, earn: 2.08 },
  { percent: 70, borrowValue: 3.61, earn: 2.11 },
  { percent: 71, borrowValue: 3.64, earn: 2.14 },
  { percent: 72, borrowValue: 3.67, earn: 2.17 },
  { percent: 73, borrowValue: 3.7, earn: 2.2 },
  { percent: 74, borrowValue: 3.73, earn: 2.23 },
  { percent: 75, borrowValue: 3.76, earn: 2.26 },
  { percent: 76, borrowValue: 3.79, earn: 2.29 },
  { percent: 77, borrowValue: 3.82, earn: 2.32 },
  { percent: 78, borrowValue: 3.85, earn: 2.35 },
  { percent: 79, borrowValue: 3.88, earn: 2.38 },
  { percent: 80, borrowValue: 3.91, earn: 2.41 },
  { percent: 81, borrowValue: 3.94, earn: 2.44 },
  { percent: 82, borrowValue: 3.97, earn: 2.47 },
  { percent: 83, borrowValue: 4.0, earn: 2.5 },
  { percent: 84, borrowValue: 4.03, earn: 2.53 },
  { percent: 85, borrowValue: 4.06, earn: 2.56 },
  { percent: 86, borrowValue: 4.09, earn: 2.59 },
  { percent: 87, borrowValue: 4.12, earn: 2.62 },
  { percent: 88, borrowValue: 4.15, earn: 2.65 },
  { percent: 89, borrowValue: 4.18, earn: 2.68 },
  { percent: 90, borrowValue: 4.5, earn: 3.51 },
  { percent: 91, borrowValue: 8.5, earn: 7.51 },
  { percent: 92, borrowValue: 12.5, earn: 11.51 },
  { percent: 93, borrowValue: 16.5, earn: 15.51 },
  { percent: 94, borrowValue: 20.5, earn: 19.51 },
  { percent: 95, borrowValue: 24.5, earn: 23.51 },
  { percent: 96, borrowValue: 28.5, earn: 27.51 },
  { percent: 97, borrowValue: 32.5, earn: 31.51 },
  { percent: 98, borrowValue: 36.5, earn: 35.51 },
  { percent: 99, borrowValue: 40.5, earn: 37.51 },
  { percent: 100, borrowValue: 44.5, earn: 39.51 },
];

export const KinkChart = () => {
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const currentUtilization = 35;
  let utilizationPosition = 15;
  if (currentUtilization >= 15 && currentUtilization <= 85) {
    utilizationPosition = currentUtilization;
  } else if (currentUtilization > 85) {
    utilizationPosition = 85;
  }

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
      </>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <ChartContainer config={chartConfig}>
          <LineChart
            width={500}
            height={300}
            data={kinkData}
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
              position={{ x: 0, y: 0 }}
            />
            <ReferenceLine
              x={currentUtilization}
              isFront
              stroke="#FFFFFF"
              label={{
                value: 'Current Utilization',
                position: 'insideTopLeft',
                fill: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '400',
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
            {currentUtilization}%
          </span>
        </div>
      </div>
    </div>
  );
};
