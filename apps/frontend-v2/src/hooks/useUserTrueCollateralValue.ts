import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { usePrice } from './usePrice';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';

// Value of collateral in USD times the liquidation factor
export const useUserTrueCollateralValue = () => {
  const { data: assetsConfigs } = useCollateralConfigurations();
  const { data: collateralBalances } = useUserCollateralAssets();
  const { data: collateralConfig } = useCollateralConfigurations();
  const { data: priceData } = usePrice();

  const trueCollateralsValue = useMemo(() => {
    if (
      collateralBalances == null ||
      assetsConfigs == null ||
      priceData == null ||
      collateralConfig == null
    )
      return BigNumber(0);
    return Object.entries(collateralBalances!).reduce((acc, [assetId, v]) => {
      const token = collateralConfig[assetId];
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
    }, BigNumber(0));
  }, [collateralBalances, assetsConfigs]);

  return trueCollateralsValue;
};
