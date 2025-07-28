import {
  GetMarketStateDocument,
  type GetMarketStateQuery,
} from '@/__generated__/swaylend/graphql';
import { appConfig } from '@/configs';

export const getMarketState = async (market: string) => {
  const url = appConfig.markets[market].graphqlUrl;

  const response = await fetch(url, {
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
