import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { usePrice } from './use-price';
import { useUserCollateralAssets } from './use-user-collateral-assets';

// Value of collateral in USD times the liquidation factor
export const useUserTrueCollateralValue = (marketParam?: string) => {
  const { data: collateralBalances } = useUserCollateralAssets(marketParam);
  const { data: collateralConfig } = useCollateralConfigurations(marketParam);
  const { data: priceData } = usePrice(marketParam);

  return useQuery({
    queryKey: [
      'userTrueCollateralValue',
      marketParam,
      collateralBalances,
      collateralConfig,
      priceData?.prices,
    ],
    queryFn: () => {
      if (
        collateralBalances == null ||
        priceData == null ||
        collateralConfig == null
      ) {
        return null;
      }

      const trueCollateralValue = Object.entries(collateralBalances).reduce(
        (acc, [assetId, v]) => {
          const token = collateralConfig[assetId];
          const liquidationFactor = formatUnits(
            BigNumber(
              collateralConfig![assetId].liquidate_collateral_factor.toString()
            ),
            18
          );
          const balance = formatUnits(v, token.decimals);
          const dollBalance = priceData.prices[assetId].times(balance);
          const trueDollBalance = dollBalance.times(liquidationFactor);
          return acc.plus(trueDollBalance);
        },
        BigNumber(0)
      );

      return trueCollateralValue;
    },
    enabled: !!collateralBalances && !!collateralConfig && !!priceData,
    refetchOnWindowFocus: false,
  });
};
