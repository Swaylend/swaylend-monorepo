import { formatUnits } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';
import { useUserTrueCollateralValue } from './useUserTrueCollateralValue';

export const useUserCollateralUtilization = () => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: trueCollateralValue } = useUserTrueCollateralValue();
  const { data: priceData } = usePrice();

  return useQuery({
    queryKey: [
      'userCollateralUtilization',
      userSupplyBorrow,
      marketConfiguration,
      trueCollateralValue,
      priceData,
    ],
    queryFn: async () => {
      if (
        !userSupplyBorrow ||
        !marketConfiguration ||
        !trueCollateralValue ||
        !priceData
      )
        return BigNumber(0);
      if (userSupplyBorrow.borrowed.eq(0)) return BigNumber(0);
      const borrowedBalance = formatUnits(
        userSupplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      );
      const baseTokenPrice = priceData.prices[marketConfiguration.baseToken];

      return borrowedBalance
        .times(baseTokenPrice)
        .dividedBy(trueCollateralValue);
    },
    enabled:
      !!userSupplyBorrow &&
      !!marketConfiguration &&
      !!trueCollateralValue &&
      !!priceData,
  });
};
