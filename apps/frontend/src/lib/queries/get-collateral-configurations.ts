import {
  GetCollateralConfigurationsDocument,
  type GetCollateralConfigurationsQuery,
} from '@/__generated__/swaylend/graphql';
import { appConfig } from '@/configs';

export const getCollateralConfigurations = async (market: string) => {
  const url = appConfig.markets[market].graphqlUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GetCollateralConfigurationsDocument,
    }),
  });

  const jsonResponse = await response.json();

  const data = (jsonResponse.data as GetCollateralConfigurationsQuery)
    .CollateralAsset;

  return data;
};
