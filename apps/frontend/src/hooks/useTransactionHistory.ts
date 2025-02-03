import { appConfig } from '@/configs';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

type Row = {
  id: string;
  poolAddress: string;
  timestamp: number;
  transactionHash: string;
  tokenAddress: string;
  amount: string;
  amountUsd: string;
  eventType: string;
};

const TX_HISTORY_PAGE_SIZE = 10;

const transactionHistoryQuery = (
  account: string,
  page: number,
  pageSize: number
) => {
  return `
        SELECT 
            id, 
            timestamp, 
            toDateTime(timestamp) as date, 
            poolAddress, 
            transactionHash, 
            tokenAddress, 
            amountNormalized as amount, 
            amountUsd,
            eventType
        FROM EventEntity 
        WHERE userAddress = lower('${account}')
        ORDER BY timestamp DESC, id
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
    `;
};

export const useTransactionHistory = (page: number) => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['transactionHistory', account, page],
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
            sql: transactionHistoryQuery(account, 1, TX_HISTORY_PAGE_SIZE),
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

      const transactionHistory = data.result.rows.map((row: Row) => ({
        id: row.id,
        market: appConfig.marketAddressToBaseAssetName[row.poolAddress],
        date: dayjs.unix(row.timestamp).utc().format('DD/MM/YYYY HH:mm:ss'),
        transactionHash: row.transactionHash,
        token: appConfig.assets[row.tokenAddress],
        amount: BigNumber(row.amount).toFixed(),
        amountUsd: BigNumber(row.amountUsd).toFixed(2),
        eventType: row.eventType,
      }));

      return transactionHistory;
    },
    enabled: !!account,
  });
};
