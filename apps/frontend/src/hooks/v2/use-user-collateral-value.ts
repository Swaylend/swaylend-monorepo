import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { usePrice } from './use-price';
import { useUserCollateralAssets } from './use-user-collateral-assets';

// Value of collateral in USD
export const useUserCollateralValue = (marketParam?: string) => {
  const { data: collateralBalances } = useUserCollateralAssets(marketParam);
  const { data: collateralConfig } = useCollateralConfigurations(marketParam);
  const { data: priceData } = usePrice(marketParam);

  return useQuery({
    queryKey: [
      'userCollateralValue',
      collateralBalances,
      priceData?.prices,
      collateralConfig,
    ],
    queryFn: () => {
      if (
        collateralBalances == null ||
        priceData == null ||
        collateralConfig == null
      ) {
        return null;
      }

      return Object.entries(collateralBalances).reduce((acc, [assetId, v]) => {
        const token = collateralConfig[assetId];
        const balance = formatUnits(v, token.decimals);
        const dollBalance = priceData.prices[assetId].times(balance);
        return acc.plus(dollBalance);
      }, BigNumber(0));
    },
    enabled: !!collateralBalances && !!priceData && !!collateralConfig,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
