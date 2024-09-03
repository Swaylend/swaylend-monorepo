import { useMarketStore } from '@/stores';
import { useUserSupplyBorrow } from './useUserSupplyBorrow';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useUserCollateralAssets } from './useUserCollateralAssets';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { usePrice } from './usePrice';
import { formatUnits } from '@/utils';
import { useMarketConfiguration } from './useMarketConfiguration';

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
      'borrowRate',
      account,
      supplyBorrow,
      collateralConfigurations,
      market,
      userCollateralAssets,
      priceData,
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
