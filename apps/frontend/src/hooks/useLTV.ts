import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserCollateralValue } from './useUserCollateralValue';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';

export const useLTV = () => {
  const { data: collateralValue } = useUserCollateralValue();
  const { data: supplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: priceData } = usePrice();

  return useQuery({
    queryKey: [
      'ltv',
      collateralValue,
      supplyBorrow,
      priceData?.prices,
      marketConfiguration,
    ],
    queryFn: async () => {
      if (
        !collateralValue ||
        !supplyBorrow ||
        !marketConfiguration ||
        !priceData
      ) {
        return null;
      }

      if (supplyBorrow.borrowed.eq(0)) {
        return BigNumber(0);
      }

      const borrowValue = supplyBorrow.borrowed
        .times(priceData.prices[marketConfiguration.baseToken.bits])
        .div(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

      return borrowValue.div(collateralValue);
    },
    enabled:
      !!collateralValue &&
      !!supplyBorrow &&
      !!marketConfiguration &&
      !!priceData,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
