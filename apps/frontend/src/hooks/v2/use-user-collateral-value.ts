import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';
import { usePriceData } from './oracles';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { useUserCollateralAssets } from './use-user-collateral-assets';

// Value of collateral in USD
export const useUserCollateralValue = (marketParam?: string) => {
  const { data: collateralBalances } = useUserCollateralAssets(marketParam);
  const { data: collateralConfig } = useCollateralConfigurations(marketParam);
  const { data: priceData } = usePriceData(marketParam);

  return useQuery({
    queryKey: [
      'userCollateralValue',
      'v2',
      collateralBalances,
      priceData?.timestamp,
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
        const assetPrice =
          priceData.prices.get(assetId)?.[0]?.price ?? BigNumber(0);
        const dollBalance = assetPrice.times(balance);
        return acc.plus(dollBalance);
      }, BigNumber(0));
    },
    enabled: !!collateralBalances && !!priceData && !!collateralConfig,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
