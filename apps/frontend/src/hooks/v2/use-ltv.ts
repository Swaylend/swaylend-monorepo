import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { createStableHash } from '@/utils';
import { usePriceData } from './oracles';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserCollateralValue } from './use-user-collateral-value';
import { useUserSupplyBorrow } from './use-user-supply-borrow';

export const useLTV = (marketParam?: string) => {
  const { data: collateralValue } = useUserCollateralValue(marketParam);
  const { data: supplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: priceData } = usePriceData(marketParam);

  return useQuery({
    queryKey: [
      'ltv',
      'v2',
      collateralValue?.toString(),
      createStableHash(supplyBorrow),
      priceData?.timestamp,
      createStableHash(marketConfiguration),
    ],
    queryFn: () => {
      if (
        !(collateralValue && supplyBorrow && marketConfiguration && priceData)
      ) {
        return null;
      }

      if (supplyBorrow.borrowed.eq(0)) {
        return BigNumber(0);
      }

      const borrowValue = supplyBorrow.borrowed
        .times(
          priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]
            ?.price ?? BigNumber(0)
        )
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
