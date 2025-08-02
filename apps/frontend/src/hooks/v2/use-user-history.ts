import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { appConfig } from '@/configs';

dayjs.extend(utc);

type Row = {
  timestampUnix: number;
  suppliedAmountUsd: number;
  borrowedAmountUsd: number;
  collateralAmountUsd: number;
};

const userHistoryQuery = (account: string, poolAddress: string) => {
  return `
        WITH bps AS (
            SELECT 
                MAX(borrowedAmountUsd) as borrowedAmountUsd,
                MIN(suppliedAmountUsd) as suppliedAmountUsd,
                MAX(toUnixTimestamp(timestamp)) as timestampUnix,
                DATE(timestamp) AS day
            FROM BasePositionSnapshot_raw
            WHERE chainId = ${appConfig.env === 'testnet' ? 0 : 9889}
                AND poolAddress = '${poolAddress}'
                AND userAddress = lower('${account}')
                AND __timestamp__ >= toDate(DATE_SUB(NOW(), INTERVAL 6 DAY))
            GROUP BY DATE(timestamp)
        ),
        cps AS (
            SELECT MAX(collateralAmountUsd) as collateralAmountUsd,
            MAX(toUnixTimestamp(timestamp)) as timestampUnix,
            DATE(timestamp) AS day
                FROM CollateralPositionSnapshot_raw
                WHERE chainId = ${appConfig.env === 'testnet' ? 0 : 9889}
                    AND poolAddress = '${poolAddress}'
                    AND userAddress = lower('${account}')
                    AND __timestamp__ >= toDate(DATE_SUB(NOW(), INTERVAL 6 DAY))
                GROUP BY DATE(timestamp)   
        )
        SELECT 
            *
        FROM bps
        LEFT JOIN cps ON bps.day = cps.day`;
};

// TODO[v2]: Maybe add tab option so user can select which pool to view history for instead of always using USDC.
export const useUserHistory = () => {
  const { account } = useAccount();
  const poolAddress = appConfig.client.v2.markets.USDC.marketAddress;

  return useQuery({
    queryKey: ['userHistory', 'v2', account],
    queryFn: async () => {
      if (!account) return null;

      const response = await fetch(appConfig.client.v2.sentioApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': appConfig.client.v2.sentioApiKey,
        },
        body: JSON.stringify({
          sqlQuery: {
            sql: userHistoryQuery(account, poolAddress),
          },
          version: appConfig.client.v2.sentioProcessorVersion,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user history.');
      }

      const data = await response.json();

      if (!data.result) {
        throw new Error('Failed to fetch user history.');
      }

      const userHistory = data.result.rows.map((row: Row) => ({
        timestamp: row.timestampUnix - 7200,
        suppliedValueUsd: Number(row.suppliedAmountUsd ?? 0).toFixed(2),
        borrowedValueUsd: Number(row.borrowedAmountUsd ?? 0).toFixed(2),
        collateralValueUsd: Number(row.collateralAmountUsd ?? 0).toFixed(2),
      }));

      return userHistory;
    },
    enabled: !!account,
  });
};
