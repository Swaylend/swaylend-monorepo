import {
  GetCollateralConfigurationsDocument,
  type GetCollateralConfigurationsQuery,
} from '@/__generated__/swaylend/graphql';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';

export const getCollateralConfigurations = async (market: DeployedMarket) => {
  const url = DEPLOYED_MARKETS[market].graphqlUrl;

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
