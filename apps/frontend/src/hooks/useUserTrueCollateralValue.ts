import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';

// Value of collateral in USD times the liquidation factor
export const useUserTrueCollateralValue = () => {
  const { data: assetsConfigs } = useCollateralConfigurations();
  const { data: collateralBalances } = useUserCollateralAssets();
  const { data: priceData } = usePrice();

  const data = useMemo(() => {
    if (
      collateralBalances == null ||
      assetsConfigs == null ||
      priceData == null
    ) {
      return null;
    }

    const trueCollateralValue = Object.entries(collateralBalances).reduce(
      (acc, [assetId, v]) => {
        const token = assetsConfigs[assetId];
        const liquidationFactor = formatUnits(
          BigNumber(
            assetsConfigs![assetId].liquidate_collateral_factor.toString()
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
  }, [collateralBalances, assetsConfigs, priceData]);
  return { data };
};
