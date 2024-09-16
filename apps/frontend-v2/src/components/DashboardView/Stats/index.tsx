import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks';

import { Skeleton } from '@/components/ui/skeleton';
import { useMarketStore } from '@/stores';
import { formatUnits } from '@/utils';
import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { InfoBowl } from './InfoBowl';

export const Stats = () => {
  const { marketMode } = useMarketStore();
  const { data: userSupplyBorrow, isPending: isPendingUserSupplyBorrow } =
    useUserSupplyBorrow();
  const {
    data: userCollateralAssets,
    isPending: isPendingUserCollateralAssets,
  } = useUserCollateralAssets();
  const { data: priceData, isPending: isPendingPriceData } = usePrice();
  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration();
  const {
    data: colateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations();

  const isLoading = useMemo(() => {
    return [
      isPendingUserSupplyBorrow,
      isPendingUserCollateralAssets,
      isPendingPriceData,
      isPendingMarketConfiguration,
      isPendingCollateralConfigurations,
    ].some((res) => res);
  }, [
    isPendingUserSupplyBorrow,
    isPendingUserCollateralAssets,
    isPendingPriceData,
    isPendingMarketConfiguration,
    isPendingCollateralConfigurations,
  ]);

  const totalSuppliedBalance = useMemo(() => {
    if (
      !marketConfiguration ||
      !userSupplyBorrow ||
      !priceData ||
      !userCollateralAssets ||
      !colateralConfigurations
    ) {
      return BigNumber(0).toFormat(2);
    }
    if (marketMode === 'lend') {
      return formatUnits(
        userSupplyBorrow.supplied.times(
          priceData.prices[marketConfiguration.baseToken]
        ),
        marketConfiguration.baseTokenDecimals
      ).toFormat(2);
    }

    if (marketMode === 'borrow') {
      return Object.entries(userCollateralAssets)
        .reduce((acc, [key, value]) => {
          return acc.plus(
            formatUnits(
              value.times(priceData.prices[key]),
              colateralConfigurations[key].decimals
            )
          );
        }, new BigNumber(0))
        .toFormat(2);
    }
  }, [
    userSupplyBorrow,
    userCollateralAssets,
    priceData,
    marketConfiguration,
    colateralConfigurations,
    marketMode,
  ]);

  const borrowedBalance = useMemo(() => {
    if (!marketConfiguration || !userSupplyBorrow) {
      return BigNumber(0).toFormat(2);
    }

    const val = formatUnits(
      userSupplyBorrow.borrowed,
      marketConfiguration.baseTokenDecimals
    );
    if (val.lt(1) && val.gt(0)) {
      return '< $1';
    }
    return `$${val.toFormat(2)}`;
  }, [marketConfiguration, userSupplyBorrow]);

  const { isConnected } = useIsConnected();

  return (
    <div className="w-full xl:px-[203px]">
      <div className="flex w-full bg-gradient-to-r justify-between from-background to-background via-primary/40 items-center h-[91px] sm:h-[123px] px-[24px] sm:px-[56px]">
        <div className="w-[300px]">
          {isConnected && (
            <div>
              <div className="text-moon text-xs sm:text-lg font-semibold">
                Supplied Balance
              </div>
              {isLoading ? (
                <Skeleton className="w-[60%] h-[40px] bg-primary/20" />
              ) : (
                <div className="text-lavender font-semibold text-lg sm:text-2xl">
                  ${totalSuppliedBalance}
                </div>
              )}
            </div>
          )}
        </div>
        <InfoBowl />
        <div className="w-[300px] text-right">
          {isConnected &&
            userSupplyBorrow &&
            userSupplyBorrow.borrowed.gt(0) &&
            marketMode === 'borrow' && (
              <div>
                <div className="text-moon text-xs sm:text-lg font-semibold">
                  Borrowed Assets
                </div>
                {isLoading ? (
                  <div className="w-full flex justify-end">
                    <Skeleton className="w-[60%] h-[40px] bg-primary/20" />
                  </div>
                ) : (
                  <div className="text-lavender font-semibold text-lg sm:text-2xl">
                    {borrowedBalance}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
