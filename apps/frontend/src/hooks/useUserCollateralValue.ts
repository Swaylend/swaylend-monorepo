import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { useMemo } from 'react';

// Value of collateral in USD times the liquidation factor
export const useUserCollateralValue = () => {
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

    return Object.entries(collateralBalances).reduce((acc, [assetId, v]) => {
      const token = assetsConfigs[assetId];
      const balance = formatUnits(v, token.decimals);
      const dollBalance = priceData.prices[assetId].times(balance);
      return acc.plus(dollBalance);
    }, BigNumber(0));
  }, [collateralBalances, assetsConfigs, priceData]);
  return { data };
};
