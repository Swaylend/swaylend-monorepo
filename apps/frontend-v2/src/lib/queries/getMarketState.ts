import {
  GetMarketStateDocument,
  type GetMarketStateQuery,
} from '@/__generated__/swaylend/graphql';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';

export const getMarketState = async (market: DeployedMarket) => {
  const url = DEPLOYED_MARKETS[market].graphqlUrl;

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
