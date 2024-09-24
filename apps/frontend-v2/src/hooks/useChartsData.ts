import { DEPLOYED_MARKETS } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export type ChartData = {
  timestamp: number;
  suppliedValueUsd: number;
  borrowedValueUsd: number;
  collateralValueUsd: number;
};

export type MarketData = {
  [market: string]: ChartData[];
};

export const useChartsData = () => {
  return useQuery({
    queryKey: ['chartsData'],
    queryFn: async () => {
      const chartDataArray = await Promise.all(
        Object.entries(DEPLOYED_MARKETS).map(async ([key, value]) => {
          const chartData = await fetch(
            `/api?poolAddress=${value.marketAddress}`
          )
            .then((res) => res.json())
            .then((data) => data.data.rows);
          return { market: key, chartData };
        })
      );

      return chartDataArray.reduce(
        (
          acc,
          { market, chartData }: { market: string; chartData: ChartData[] }
        ) => {
          acc[market] = chartData.map((row: ChartData) => {
            return {
              timestamp: row.timestamp,
              suppliedValueUsd: Number(row.suppliedValueUsd),
              borrowedValueUsd: Number(row.borrowedValueUsd),
              collateralValueUsd: Number(row.collateralValueUsd),
            };
          });
          return acc;
        },
        {} as MarketData
      );
    },
    retry: 3,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
};
