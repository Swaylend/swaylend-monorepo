import {
  GetCollateralAssetsDocument,
  type GetCollateralAssetsQuery,
} from '@/__generated__/swaylend/graphql';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';

export const getCollateralAssets = async (
  address: string,
  market: DeployedMarket
) => {
  const url = DEPLOYED_MARKETS[market].graphqlUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GetCollateralAssetsDocument,
      variables: {
        account: address,
      },
    }),
  });

  const jsonResponse = await response.json();

  const data = (jsonResponse.data as GetCollateralAssetsQuery).User;

  return data;
};
