'use client';
import React, { PureComponent, useState } from 'react';
import { MarketsTable } from './MarketsTable';
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
  ChartTooltipContent,
} from '../ui/chart';

export const MarketsView = () => {
  const chartData = [
    { month: 'January', desktop: 186, mobile: 80, tablet: 100 },
    { month: 'February', desktop: 305, mobile: 200, tablet: 100 },
    { month: 'March', desktop: 237, mobile: 120, tablet: 120 },
    { month: 'April', desktop: 73, mobile: 190, tablet: 90 },
    { month: 'May', desktop: 209, mobile: 130, tablet: 110 },
    { month: 'June', desktop: 214, mobile: 140, tablet: 170 },
  ];

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--primary))',
    },
    tablet: {
      label: 'Tablet',
      color: '#918E8E',
    },
    mobile: {
      label: 'Mobile',
      color: '#8B5CF6',
    },
  } satisfies ChartConfig;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalSupply = payload.reduce(
        (acc: any, curr: { value: any }) => acc + curr.value,
        0
      );
      return (
        <div className="bg-card/80 p-4 rounded-md border-[1px] border-white/20 shadow-md">
          <div className="flex justify-between gap-x-6 items-center">
            <div className="text-white text-sm font-semibold">Total Supply</div>
            <div className="text-white text-sm font-semibold">
              ${totalSupply}
            </div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
              <div className="text-white/60 text-xs font-normal">
                Collateral
              </div>
            </div>
            <div>{payload[0].value}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="text-white/60 text-xs font-normal">Earning</div>
            </div>
            <div>{payload[1].value}</div>
          </div>
          <div className="flex justify-between gap-x-2 items-center mt-2">
            <div className="flex gap-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-purple" />
              <div className="text-white/60 text-xs font-normal">Borrowing</div>
            </div>
            <div>{payload[2].value}</div>
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
  const [hoveredTick, setHoveredTick] = useState<string | null>(null);

  return (
    <div className="pt-[55px] pb-[55px] px-[88px] flex flex-col w-full items-center justify-center">
      <div className="w-full flex justify-center items-center gap-x-4">
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="text-white text-md font-normal">Earning</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-purple" />
          <div className="text-white text-md font-normal">Borrowing</div>
        </div>
        <div className="flex gap-x-2 items-center">
          <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
          <div className="text-white text-md font-normal">Collateral</div>
        </div>
      </div>
      <div className="w-full h-[300px] mt-4 mb-[55px]">
        <ResponsiveContainer width="100%">
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 16,
                right: 16,
              }}
            >
              <CartesianGrid vertical={false} stroke="#ffffff" opacity={0.2} />
              <XAxis
                dataKey="month"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                tickFormatter={(value: string) => value.slice(0, 3)}
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
                dataKey="mobile"
                type="natural"
                fill="url(#color1)"
                fillOpacity={0.4}
                stroke="#8b5cf6"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#color2)"
                fillOpacity={0.4}
                strokeWidth={2}
                stroke="var(--color-desktop)"
                stackId="a"
              />
              <Area
                dataKey="tablet"
                type="natural"
                fill="url(#color3)"
                fillOpacity={0.4}
                strokeWidth={2}
                stroke="var(--color-tablet)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </div>
      <MarketsTable />
    </div>
  );
};
