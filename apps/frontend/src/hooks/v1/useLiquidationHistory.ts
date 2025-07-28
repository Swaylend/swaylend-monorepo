import { appConfig } from '@/configs';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

type Row = {
  id: string;
  poolAddress: string;
  timestamp: number;
  transactionHash: string;
};

const liquidationHistoryQuery = (account: string) => {
  return `
        SELECT 
            id, 
            poolAddress, 
            timestamp, 
            transactionHash 
        FROM Liquidation
        WHERE userAddress = lower('${account}')
        ORDER BY timestamp DESC
    `;
};

export const useLiquidationHistory = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['transactionHistory', account],
    queryFn: async () => {
      if (!account) return null;

      const response = await fetch(appConfig.client.sentioApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': appConfig.client.sentioApiKey,
        },
        body: JSON.stringify({
          sqlQuery: {
            sql: liquidationHistoryQuery(account),
          },
          version: appConfig.client.sentioProcessorVersion,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history.');
      }

      const data = await response.json();

      if (!data.result) {
        throw new Error('Failed to fetch transaction history.');
      }

      const liquidationHistory = data.result.rows.map((row: Row) => ({
        id: row.id,
        market: appConfig.marketAddressToBaseAssetName[row.poolAddress],
        date: dayjs.unix(row.timestamp).utc().format('DD/MM/YYYY HH:mm:ss'),
        transactionHash: row.transactionHash,
      }));

      return liquidationHistory;
    },
    enabled: !!account,
  });
};
