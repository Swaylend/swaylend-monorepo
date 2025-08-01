import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import { appConfig } from '@/configs';

const totalTransactionCountQuery = (account: string) => {
  return `
        SELECT 
          count(*) as total_count
        FROM EventEntity 
        WHERE userAddress = lower('${account}')
        AND amountUsd > 0
    `;
};

export const useTotalTransactionCount = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['totalTransactionCount', 'v2', account],
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
            sql: totalTransactionCountQuery(account),
          },
          version: appConfig.client.v2.sentioProcessorVersion,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history.');
      }

      const data = await response.json();

      if (!data.result) {
        throw new Error('Failed to fetch transaction history.');
      }

      if (!data.result.rows || data.result.rows.length === 0) {
        return 1;
      }

      return data.result.rows[0].total_count;
    },
    enabled: !!account,
  });
};
