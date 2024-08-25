import {
  GetCollateralAssetsDocument,
  type GetCollateralAssetsQuery,
} from '@/__generated__/swaylend/graphql';
import { GRAPHQL_URL } from '@/utils';

export const getCollateralAssets = async (address: string) => {
  const response = await fetch(GRAPHQL_URL, {
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
