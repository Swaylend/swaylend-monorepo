import {
  useBorrowCapacity,
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
import { Repeat } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { InfoBowl } from './InfoBowl';

export const Stats = () => {
  const [borrowedMode, setBorrowedMode] = useState(1); // 0: available to borrow, 1: borrowed
  const { marketMode } = useMarketStore();
  const { data: userSupplyBorrow, isPending: isPendingUserSupplyBorrow } =
    useUserSupplyBorrow();
  const { data: borrowCapacity } = useBorrowCapacity();
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

  const { isConnected } = useIsConnected();

  const borrowedBalanceText = useMemo(() => {
    if (
      !isConnected ||
      !borrowCapacity ||
      !userSupplyBorrow ||
      !marketConfiguration
    ) {
      return { title: '', value: '' };
    }
    // Borrowed + Available to Borrow
    if (userSupplyBorrow.borrowed.gt(0)) {
      // Available to Borrow
      if (borrowedMode === 0) {
        if (borrowCapacity.lt(1) && borrowCapacity.gt(0)) {
          return { title: 'Available to Borrow', value: '< $1' };
        }
        return {
          title: 'Available to Borrow',
          value: `$${borrowCapacity.toFormat(2)}`,
        };
      }
      // Borrowed
      const val = formatUnits(
        userSupplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      );
      if (val.lt(1) && val.gt(0)) {
        return { title: 'Borrowed', value: '< $1' };
      }
      return { title: 'Borrowed', value: `$${val.toFormat(2)}` };
    }
    // Available to borrow
    if (borrowCapacity.lt(1) && borrowCapacity.gt(0)) {
      return { title: 'Available to Borrow', value: '< $1' };
    }
    return {
      title: 'Available to Borrow',
      value: `$${borrowCapacity.toFormat(2)}`,
    };
  }, [isConnected, borrowCapacity, userSupplyBorrow, borrowedMode]);

  return (
    <div className="w-full xl:px-[140px] 2xl:px-[203px]">
      <div className="flex w-full bg-gradient-to-r justify-between from-background to-background via-primary/40 items-center h-[91px] sm:h-[123px] px-[24px] sm:px-[56px]">
        <div className="w-[300px]">
          {isConnected && (
            <div>
              <div className="text-moon text-xs sm:text-md lg:text-lg font-semibold">
                Supplied Balance
              </div>
              {isLoading ? (
                <Skeleton className="w-[60%] h-[25px] mt-2 sm:h-[40px] bg-primary/20" />
              ) : (
                <div className="text-lavender font-semibold text-lg sm:text-xl lg:text-2xl">
                  ${totalSuppliedBalance}
                </div>
              )}
            </div>
          )}
        </div>
        <InfoBowl />
        <div className="w-[300px] text-right">
          {isConnected && userSupplyBorrow && marketMode === 'borrow' && (
            <div>
              <div className="text-moon flex items-center justify-end gap-x-1 text-xs sm:text-md lg:text-lg font-semibold">
                {borrowedBalanceText.title}
                {userSupplyBorrow.borrowed.gt(0) && (
                  <button
                    className=""
                    type="button"
                    onClick={() => {
                      setBorrowedMode(borrowedMode === 0 ? 1 : 0);
                    }}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="w-full flex justify-end">
                  <Skeleton className="w-[60%] h-[25px] mt-2 sm:h-[40px] bg-primary/20" />
                </div>
              ) : (
                <div className="text-lavender font-semibold text-lg sm:text-xl lg:text-2xl">
                  {borrowedBalanceText.value}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
