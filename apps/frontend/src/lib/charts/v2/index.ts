import { appConfig } from '@/configs';
import { getMarketsCombinedQuery } from './get-markets-combined-query';
import { getSingleMarketQuery } from './get-single-market-query';

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
  const url = appConfig.client.v2.sentioApi;
  const apiKey = appConfig.client.v2.sentioApiKey;

  if (!(apiKey && url)) {
    return;
  }

  const singleMarketData = await Promise.all(
    Object.entries(appConfig.client.v2.markets).map(async ([key, value]) => {
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
            size: 10_000,
          },
          version: appConfig.client.v2.sentioProcessorVersion,
        }),
        next: {
          revalidate: 3600, // Cache for 1h
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
        size: 10_000,
      },
      version: appConfig.client.v2.sentioProcessorVersion,
    }),
    next: {
      revalidate: 3600, // Cache for 1h
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
