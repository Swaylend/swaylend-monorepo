import { appConfig } from '@/configs';
import { getMarketsCombinedQuery } from './getMarketsCombinedQuery';
import { getSingleMarketQuery } from './getSingleMarketQuery';

export type ChartData = {
  timestamp: number;
  suppliedValueUsd: number;
  borrowedValueUsd: number;
  collateralValueUsd: number;
};

export type MarketData = {
  [market: string]: ChartData[];
};

export const getChartData = async () => {
  const url = appConfig.server.sentioApi;
  const apiKey = appConfig.server.sentioApiKey;

  if (!apiKey || !url) {
    return;
  }

  const singleMarketData = await Promise.all(
    Object.entries(appConfig.markets).map(async ([key, value]) => {
      const poolAddress = value.marketAddress;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sqlQuery: {
            sql: getSingleMarketQuery(poolAddress),
            size: 10000,
          },
          version: appConfig.server.sentioProcessorVersion,
        }),
        next: {
          revalidate: 300, // Cache for 5 min
        },
      });

      const data = await response.json();

      return [
        key,
        data.result.rows.map((row: ChartData) => ({
          timestamp: row.timestamp,
          suppliedValueUsd: Number(row.suppliedValueUsd),
          borrowedValueUsd: Number(row.borrowedValueUsd),
          collateralValueUsd: Number(row.collateralValueUsd),
          // supplyApr: Number(row.supplyApr), // TODO: Include this 2 in the per market chart
          // borrowApr: Number(row.borrowApr),
        })),
      ];
    })
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sqlQuery: {
        sql: getMarketsCombinedQuery(),
        size: 10000,
      },
      version: appConfig.server.sentioProcessorVersion,
    }),
    next: {
      revalidate: 300, // Cache for 5 min
    },
  });

  const queryData = await response.json();

  const marketsCombinedData: ChartData[] = queryData.result.rows.map(
    (row: ChartData) => ({
      timestamp: row.timestamp,
      suppliedValueUsd: row.suppliedValueUsd,
      borrowedValueUsd: row.borrowedValueUsd,
      collateralValueUsd: row.collateralValueUsd,
    })
  );

  return {
    singleMarketData: Object.fromEntries(singleMarketData) as MarketData,
    marketsCombinedData,
  };
};
