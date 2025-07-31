import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';
import { usePriceData } from './oracles';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserSupplyBorrow } from './use-user-supply-borrow';
import { useUserTrueCollateralValue } from './use-user-true-collateral-value';

export const useUserCollateralUtilization = (marketParam?: string) => {
  const { data: userSupplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: trueCollateralValue } = useUserTrueCollateralValue(marketParam);
  const { data: priceData } = usePriceData(marketParam);

  return useQuery({
    queryKey: [
      'userCollateralUtilization',
      'v2',
      userSupplyBorrow,
      marketConfiguration,
      trueCollateralValue,
      marketParam,
      priceData?.timestamp,
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
        priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]?.price ??
        BigNumber(0);

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
