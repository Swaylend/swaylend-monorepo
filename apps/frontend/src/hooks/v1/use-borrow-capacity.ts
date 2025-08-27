import { useAccount } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { createStableHash, formatUnits } from '@/utils';
import { useCollateralConfigurations } from './use-collateral-configurations';
import { useMarketConfiguration } from './use-market-configuration';
import { usePrice } from './use-price';
import { useUserCollateralAssets } from './use-user-collateral-assets';
import { useUserSupplyBorrow } from './use-user-supply-borrow';

export const useBorrowCapacity = () => {
  const { account } = useAccount();
  const { data: supplyBorrow } = useUserSupplyBorrow();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();

  return useQuery({
    queryKey: [
      'borrowCapacity',
      'v1',
      account,
      createStableHash(supplyBorrow),
      createStableHash(collateralConfigurations),
      createStableHash(userCollateralAssets),
      createStableHash(priceData?.prices),
      createStableHash(marketConfiguration),
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

      const borrowCapacity = Object.entries(userCollateralAssets)
        .reduce((acc, [key, value]) => {
          return acc.plus(
            formatUnits(
              value.times(
                priceData.prices[key].minus(priceData.confidenceIntervals[key])
              ),
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
            supplyBorrow.borrowed.times(
              priceData.prices[marketConfiguration.baseToken.bits]
            ),
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
