import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { usePrice } from './oracles/use-pyth-oracle';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserSupplyBorrow } from './use-user-supply-borrow';
import { useUserTrueCollateralValue } from './use-user-true-collateral-value';

export const useHealthFactor = (marketParam?: string) => {
  const { data: trueCollateralValue } = useUserTrueCollateralValue(marketParam);
  const { data: supplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: priceData } = usePrice(marketParam);

  return useQuery({
    queryKey: [
      'healthFactor',
      'v2',
      trueCollateralValue,
      supplyBorrow,
      priceData?.prices,
      marketConfiguration,
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
