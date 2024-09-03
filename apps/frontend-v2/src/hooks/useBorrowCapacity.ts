import { useMarketStore } from '@/stores';
import { formatUnits } from '@/utils';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { usePrice } from './usePrice';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';

export const useBorrowCapacity = () => {
  const { market } = useMarketStore();
  const { account } = useAccount();
  const { data: supplyBorrow } = useUserSupplyBorrow();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();

  return useQuery({
    queryKey: [
      'borrowCapacity',
      account,
      supplyBorrow,
      collateralConfigurations,
      market,
      userCollateralAssets,
      priceData?.prices,
      marketConfiguration,
    ],
    queryFn: async () => {
      if (
        !account ||
        !supplyBorrow ||
        !collateralConfigurations ||
        !userCollateralAssets ||
        !priceData ||
        !marketConfiguration
      ) {
        return BigNumber(0);
      }

      const borrowCapacity = Object.entries(userCollateralAssets)
        .reduce((acc, [key, value]) => {
          return acc.plus(
            formatUnits(
              value.times(priceData.prices[key]),
              collateralConfigurations[key].decimals
            )
          );
        }, new BigNumber(0))
        .minus(
          formatUnits(
            supplyBorrow.borrowed.times(
              priceData.prices[marketConfiguration.baseToken]
            ),
            marketConfiguration.baseTokenDecimals
          )
        );

      return borrowCapacity;
    },
    enabled:
      !!account &&
      !!supplyBorrow &&
      !!collateralConfigurations &&
      !!userCollateralAssets &&
      !!priceData &&
      !!marketConfiguration,
  });
};