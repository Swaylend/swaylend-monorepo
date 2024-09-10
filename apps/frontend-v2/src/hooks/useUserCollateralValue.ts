import { formatUnits } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';

// Value of collateral in USD times the liquidation factor
export const useUserCollateralValue = () => {
  const { data: assetsConfigs } = useCollateralConfigurations();
  const { data: collateralBalances } = useUserCollateralAssets();
  const { data: collateralConfig } = useCollateralConfigurations();
  const { data: priceData } = usePrice();

  return useQuery({
    queryKey: [
      'userCollateralValue',
      collateralBalances,
      assetsConfigs,
      priceData,
      collateralConfig,
    ],
    queryFn: async () => {
      if (
        collateralBalances == null ||
        assetsConfigs == null ||
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
    enabled:
      !!collateralBalances &&
      !!assetsConfigs &&
      !!priceData &&
      !!collateralConfig,
  });
};
