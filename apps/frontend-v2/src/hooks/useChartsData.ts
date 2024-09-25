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

export const useChartsData = async () => {
  const url = process.env.SENTIO_API_URL;
  const apiKey = process.env.SENTIO_API_KEY;

  if (!apiKey || !url) {
    return;
  }

  const chartDataArray = await Promise.all(
    Object.entries(DEPLOYED_MARKETS).map(async ([key, value]) => {
      const poolAddress = value.marketAddress;

      const query = {
        sqlQuery: {
          sql: `
            SELECT 
              COALESCE(a.timestamp, b.timestamp) AS timestamp,
              COALESCE(a.suppliedValueUsd, 0) AS suppliedValueUsd,
              COALESCE(b.collateralValueUsd, 0) AS collateralValueUsd,
              COALESCE(a.borrowedValueUsd, 0) AS borrowedValueUsd
              FROM (
                  SELECT 
                  timestamp,
                  FLOOR(SUM(suppliedAmountUsd)) AS suppliedValueUsd,
                  NULL AS collateralValueUsd,
                  FLOOR(SUM(borrowedAmountUsd)) AS borrowedValueUsd
              FROM \`BasePoolSnapshot_raw\`
              WHERE 
                  chainId = 0 
                  AND 
                  poolAddress = "${poolAddress}"
              GROUP BY timestamp, chainId, poolAddress
              ) a
              LEFT JOIN (
                  SELECT 
                    timestamp,
                  NULL AS suppliedValueUsd,
                  FLOOR(SUM(collateralAmountUsd)) AS collateralValueUsd,
                  NULL AS borrowedValueUsd
              FROM \`CollateralPoolSnapshot_raw\`
              WHERE 
                  chainId = 0 
                  AND 
                  poolAddress = "${poolAddress}"
              GROUP BY timestamp, chainId, poolAddress
              ) b
              ON a.timestamp = b.timestamp

              UNION ALL

              SELECT 
                  COALESCE(a.timestamp, b.timestamp) AS timestamp,
                  COALESCE(a.suppliedValueUsd, 0) AS suppliedValueUsd,
                  COALESCE(b.collateralValueUsd, 0) AS collateralValueUsd,
                  COALESCE(a.borrowedValueUsd, 0) AS borrowedValueUsd
              FROM (
                      SELECT 
                  timestamp,
                  FLOOR(SUM(suppliedAmountUsd)) AS suppliedValueUsd,
                  NULL AS collateralValueUsd,
                  FLOOR(SUM(borrowedAmountUsd)) AS borrowedValueUsd
              FROM \`BasePoolSnapshot_raw\`
              WHERE 
                  chainId = 0 
                  AND 
                  poolAddress = "${poolAddress}"
              GROUP BY timestamp, chainId, poolAddress
              ) a
              RIGHT JOIN (
                  SELECT 
                      timestamp,
                  FLOOR(SUM(collateralAmountUsd)) AS collateralValueUsd,
                  NULL AS suppliedValueUsd,
                  NULL AS borrowedValueUsd
              FROM \`CollateralPoolSnapshot_raw\`
              WHERE 
                  chainId = 0 
                  AND 
                  poolAddress = "${poolAddress}"
                  GROUP BY timestamp, chainId, poolAddress
              ) b
              ON a.timestamp = b.timestamp
              ORDER BY timestamp ASC;
          `,
          size: 10000,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        next: { revalidate: 60 },
      });
      const data = await response.json();
      return { market: key, chartData: data.result.rows };
    })
  );

  const chartsData = chartDataArray.reduce(
    (
      acc,
      { market, chartData }: { market: string; chartData: ChartData[] }
    ) => {
      acc[market] = chartData
        .map((row: ChartData) => {
          return {
            timestamp: row.timestamp,
            suppliedValueUsd: Number(row.suppliedValueUsd),
            borrowedValueUsd: Number(row.borrowedValueUsd),
            collateralValueUsd: Number(row.collateralValueUsd),
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp);
      return acc;
    },
    {} as MarketData
  );

  const usdcChartData = chartsData?.USDC.sort(
    (a, b) => a.timestamp - b.timestamp
  );
  const usdtChartData = chartsData?.USDT.sort(
    (a, b) => a.timestamp - b.timestamp
  );
  if (!usdcChartData || !usdtChartData) return chartsData;
  const mergedData: ChartData[] = [];

  usdcChartData.forEach((usdcRow) => {
    const usdtRow = usdtChartData.find(
      (row) => row.timestamp === usdcRow.timestamp
    );

    if (usdtRow) {
      mergedData.push({
        timestamp: usdcRow.timestamp,
        suppliedValueUsd:
          Number(usdcRow.suppliedValueUsd) + Number(usdtRow.suppliedValueUsd),
        borrowedValueUsd:
          Number(usdcRow.borrowedValueUsd) + Number(usdtRow.borrowedValueUsd),
        collateralValueUsd:
          Number(usdcRow.collateralValueUsd) +
          Number(usdtRow.collateralValueUsd),
      });
    } else {
      mergedData.push({
        timestamp: usdcRow.timestamp,
        suppliedValueUsd: Number(usdcRow.suppliedValueUsd),
        borrowedValueUsd: Number(usdcRow.borrowedValueUsd),
        collateralValueUsd: Number(usdcRow.collateralValueUsd),
      });
    }
  });

  chartsData.merged = mergedData.sort((a, b) => a.timestamp - b.timestamp);
  return chartsData;
};
