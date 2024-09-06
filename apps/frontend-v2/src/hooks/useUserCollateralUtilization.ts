import { formatUnits } from '@/utils';
import { useAccount } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { useUserCollateralValue } from './useUserCollateralValue';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';
import { useUserTrueCollateralValue } from './useUserTrueCollateralValue';

export const useUserCollateralUtilization = () => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: assetsConfigs } = useCollateralConfigurations();
  const { data: collateralBalances } = useUserCollateralAssets();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: collateralConfig } = useCollateralConfigurations();
  const trueCollateralValue = useUserTrueCollateralValue();
  const collateralValue = useUserCollateralValue();
  const { data: priceData } = usePrice();

  const borrowedBalance = useMemo(() => {
    if (userSupplyBorrow == null) return BigNumber(0);
    return userSupplyBorrow.borrowed;
  }, [userSupplyBorrow]);

  const baseTokenPrice = useMemo(() => {
    if (!priceData || !marketConfiguration) return BigNumber(0);
    return priceData.prices[marketConfiguration.baseToken];
  }, [priceData, marketConfiguration]);

  const loanValue = useMemo(() => {
    if (!priceData || !marketConfiguration) return BigNumber(0);
    return formatUnits(
      borrowedBalance ?? BigNumber(0),
      marketConfiguration.baseTokenDecimals
    ).times(baseTokenPrice);
  }, [borrowedBalance, baseTokenPrice, marketConfiguration]);

  const res = useMemo(() => {
    if (!trueCollateralValue.gt(0)) return BigNumber(0);
    return loanValue.div(trueCollateralValue);
  }, [loanValue, trueCollateralValue]);
  if (res.isNaN()) return BigNumber(0);

  return res;
};
