import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { createStableHash } from '@/utils';
import { usePriceData } from './oracles';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserSupplyBorrow } from './use-user-supply-borrow';
import { useUserTrueCollateralValue } from './use-user-true-collateral-value';

export const useHealthFactor = (marketParam?: string) => {
  const { data: trueCollateralValue } = useUserTrueCollateralValue(marketParam);
  const { data: supplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: priceData } = usePriceData(marketParam);

  return useQuery({
    queryKey: [
      'healthFactor',
      'v2',
      trueCollateralValue?.toString(),
      createStableHash(supplyBorrow),
      priceData?.timestamp,
      createStableHash(marketConfiguration),
    ],
    queryFn: () => {
      if (
        !(
          trueCollateralValue &&
          supplyBorrow &&
          marketConfiguration &&
          priceData
        )
      ) {
        return null;
      }

      if (supplyBorrow.borrowed.eq(0)) {
        return BigNumber(1);
      }

      const borrowValue = supplyBorrow.borrowed
        .times(
          priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]
            ?.price ?? BigNumber(0)
        )
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
