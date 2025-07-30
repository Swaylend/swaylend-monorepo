import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { usePrice } from './oracles/use-pyth-oracle';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserCollateralValue } from './use-user-collateral-value';
import { useUserSupplyBorrow } from './use-user-supply-borrow';

export const useLTV = (marketParam?: string) => {
  const { data: collateralValue } = useUserCollateralValue(marketParam);
  const { data: supplyBorrow } = useUserSupplyBorrow(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: priceData } = usePrice(marketParam);

  return useQuery({
    queryKey: [
      'ltv',
      'v2',
      collateralValue,
      supplyBorrow,
      priceData?.prices,
      marketConfiguration,
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
