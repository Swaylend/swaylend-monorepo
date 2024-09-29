import {
  GetMarketConfigurationDocument,
  type GetMarketConfigurationQuery,
} from '@/__generated__/swaylend/graphql';
import { appConfig } from '@/configs';

export const getMarketConfiguration = async (market: string) => {
  const url = appConfig.markets[market].graphqlUrl;

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
