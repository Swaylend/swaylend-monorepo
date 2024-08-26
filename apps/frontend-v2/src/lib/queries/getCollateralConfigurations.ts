import {
  GetCollateralConfigurationsDocument,
  type GetCollateralConfigurationsQuery,
} from '@/__generated__/swaylend/graphql';
import { GRAPHQL_URL } from '@/utils';

export const getCollateralConfigurations = async () => {
  const response = await fetch(GRAPHQL_URL, {
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
