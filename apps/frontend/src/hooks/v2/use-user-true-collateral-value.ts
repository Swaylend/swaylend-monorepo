import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { createStableHash, formatUnits } from '@/utils';
import { usePriceData } from './oracles';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { useUserCollateralAssets } from './use-user-collateral-assets';

// Value of collateral in USD times the liquidation factor
export const useUserTrueCollateralValue = (marketParam?: string) => {
  const { data: collateralBalances } = useUserCollateralAssets(marketParam);
  const { data: collateralConfig } = useCollateralConfigurations(marketParam);
  const { data: priceData } = usePriceData(marketParam);

  return useQuery({
    queryKey: [
      'userTrueCollateralValue',
      'v2',
      marketParam,
      createStableHash(collateralBalances),
      createStableHash(collateralConfig),
      priceData?.timestamp,
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
          const assetPrice =
            priceData.prices.get(assetId)?.[0]?.price ?? BigNumber(0);
          const dollBalance = assetPrice.times(balance);
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
