import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';
import { useUserTrueCollateralValue } from './useUserTrueCollateralValue';

export const useUserCollateralUtilization = () => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: trueCollateralValue } = useUserTrueCollateralValue();
  const { data: priceData } = usePrice();

  const data = useMemo(() => {
    if (
      !userSupplyBorrow ||
      !marketConfiguration ||
      !trueCollateralValue ||
      !priceData
    ) {
      return null;
    }

    if (userSupplyBorrow.borrowed.eq(0)) return BigNumber(0);

    const borrowedBalance = formatUnits(
      userSupplyBorrow.borrowed,
      marketConfiguration.baseTokenDecimals
    );
    const baseTokenPrice = priceData.prices[marketConfiguration.baseToken.bits];

    return borrowedBalance.times(baseTokenPrice).dividedBy(trueCollateralValue);
  }, [userSupplyBorrow, marketConfiguration, trueCollateralValue, priceData]);
  return { data };
};
