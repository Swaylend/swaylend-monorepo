import {
  GetMarketStateDocument,
  type GetMarketStateQuery,
} from '@/__generated__/swaylend/graphql';
import { GRAPHQL_URL } from '@/utils';

export const getMarketState = async () => {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GetMarketStateDocument,
    }),
  });

  const jsonResponse = await response.json();

  const data = (jsonResponse.data as GetMarketStateQuery).MarketState;

  return data;
};
