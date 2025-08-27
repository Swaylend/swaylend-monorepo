import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { createStableHash, formatUnits } from '@/utils';
import { useMarketConfiguration } from './use-market-configuration';
import { usePrice } from './use-price';
import { useUserSupplyBorrow } from './use-user-supply-borrow';
import { useUserTrueCollateralValue } from './use-user-true-collateral-value';

export const useUserCollateralUtilization = (marketParam?: string) => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: trueCollateralValue } = useUserTrueCollateralValue(marketParam);
  const { data: priceData } = usePrice(marketParam);

  return useQuery({
    queryKey: [
      'userCollateralUtilization',
      'v1',
      createStableHash(userSupplyBorrow),
      createStableHash(marketConfiguration),
      trueCollateralValue,
      marketParam,
      createStableHash(priceData?.prices),
    ],
    queryFn: () => {
      if (
        !(
          userSupplyBorrow &&
          marketConfiguration &&
          trueCollateralValue &&
          priceData
        )
      ) {
        return null;
      }

      if (userSupplyBorrow.borrowed.eq(0)) return BigNumber(0);

      const borrowedBalance = formatUnits(
        userSupplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      );
      const baseTokenPrice =
        priceData.prices[marketConfiguration.baseToken.bits];

      return borrowedBalance
        .times(baseTokenPrice)
        .dividedBy(trueCollateralValue);
    },
    enabled:
      !!userSupplyBorrow &&
      !!marketConfiguration &&
      !!trueCollateralValue &&
      !!priceData,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
