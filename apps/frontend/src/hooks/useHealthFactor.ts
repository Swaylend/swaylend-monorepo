import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';
import { useUserTrueCollateralValue } from './useUserTrueCollateralValue';

export const useHealthFactor = (marketParam?: string) => {
  const { data: trueCollateralValue } = useUserTrueCollateralValue(marketParam);
  const { data: supplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: priceData } = usePrice(marketParam);

  return useQuery({
    queryKey: [
      'healthFactor',
      trueCollateralValue,
      supplyBorrow,
      priceData?.prices,
      marketConfiguration,
    ],
    queryFn: async () => {
      if (
        !trueCollateralValue ||
        !supplyBorrow ||
        !marketConfiguration ||
        !priceData
      ) {
        return null;
      }

      if (supplyBorrow.borrowed.eq(0)) {
        return BigNumber(1);
      }

      const borrowValue = supplyBorrow.borrowed
        .times(priceData.prices[marketConfiguration.baseToken.bits])
        .div(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

      return trueCollateralValue.div(borrowValue);
    },
    enabled:
      !!trueCollateralValue &&
      !!supplyBorrow &&
      !!marketConfiguration &&
      !!priceData,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
