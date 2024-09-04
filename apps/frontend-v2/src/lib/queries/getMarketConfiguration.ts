import {
  GetMarketConfigurationDocument,
  type GetMarketConfigurationQuery,
} from '@/__generated__/swaylend/graphql';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';

export const getMarketConfiguration = async (market: DeployedMarket) => {
  const url = DEPLOYED_MARKETS[market].graphqlUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GetMarketConfigurationDocument,
    }),
  });

  const jsonResponse = await response.json();

  const data = (jsonResponse.data as GetMarketConfigurationQuery)
    .MarketConfiguartion;

  return data;
};
