import { appConfig } from '@/configs';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';

const totalTransactionCountQuery = (account: string) => {
  return `
        SELECT 
          count(*) as total_count
        FROM EventEntity 
        WHERE userAddress = lower('${account}')
    `;
};

export const useTotalTransactionCount = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['totalTransactionCount', account],
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
            sql: totalTransactionCountQuery(account),
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

      if (!data.result.rows || data.result.rows.length === 0) {
        return 1;
      }

      return data.result.rows[0].total_count;
    },
    enabled: !!account,
  });
};
