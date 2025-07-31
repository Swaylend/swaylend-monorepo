import { useAccount } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { formatUnits } from '@/utils';
import { usePriceData } from './oracles';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { useMarketConfiguration } from './use-market-configuration';
import { useUserCollateralAssets } from './use-user-collateral-assets';
import { useUserSupplyBorrow } from './use-user-supply-borrow';

export const useBorrowCapacity = () => {
  const { account } = useAccount();
  const { data: supplyBorrow } = useUserSupplyBorrow();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePriceData();
  const { data: marketConfiguration } = useMarketConfiguration();

  return useQuery({
    queryKey: [
      'borrowCapacity',
      'v2',
      account,
      supplyBorrow,
      collateralConfigurations,
      userCollateralAssets,
      priceData?.timestamp,
      marketConfiguration,
    ],
    queryFn: () => {
      if (
        !(
          account &&
          supplyBorrow &&
          collateralConfigurations &&
          userCollateralAssets &&
          priceData &&
          marketConfiguration
        )
      ) {
        return null;
      }

      const baseTokenPrice =
        priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]?.price ??
        BigNumber(0);

      const borrowCapacity = Object.entries(userCollateralAssets)
        .reduce((acc, [key, value]) => {
          const price = priceData.prices.get(key)?.[0]?.price ?? BigNumber(0);
          const confidence =
            priceData.prices.get(key)?.[0]?.confidence ?? BigNumber(0);

          return acc.plus(
            formatUnits(
              value.times(price.minus(confidence)),
              collateralConfigurations[key].decimals
            ).times(
              formatUnits(
                BigNumber(
                  collateralConfigurations[
                    key
                  ].borrow_collateral_factor.toString() ?? 0
                ),
                18
              )
            )
          );
        }, new BigNumber(0))
        .minus(
          formatUnits(
            supplyBorrow.borrowed.times(baseTokenPrice),
            marketConfiguration.baseTokenDecimals
          )
        );

      return borrowCapacity.lt(0) ? BigNumber(0) : borrowCapacity;
    },
    enabled:
      !!account &&
      !!supplyBorrow &&
      !!collateralConfigurations &&
      !!userCollateralAssets &&
      !!priceData &&
      !!marketConfiguration,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
