import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import { Repeat } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { appConfig } from '@/configs';
import {
  useBorrowCapacity,
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { MARKET_MODE, useMarketStore } from '@/stores/market-store';
import { formatUnits, getFormattedPrice } from '@/utils';
import { InfoBowl } from './info-bowl';

export const Stats = () => {
  const [borrowedMode, setBorrowedMode] = useState(1); // 0: available to borrow, 1: borrowed
  const marketMode = useMarketStore.use.marketMode();
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
      !(
        marketConfiguration &&
        userSupplyBorrow &&
        priceData &&
        userCollateralAssets &&
        colateralConfigurations
      )
    ) {
      return BigNumber(0);
    }
    if (marketMode === 'lend') {
      return formatUnits(
        userSupplyBorrow.supplied,
        marketConfiguration.baseTokenDecimals
      );
    }

    if (marketMode === 'borrow') {
      return Object.entries(userCollateralAssets).reduce(
        (acc, [key, value]) => {
          return acc.plus(
            formatUnits(
              value.times(priceData.prices[key]),
              colateralConfigurations[key].decimals
            )
          );
        },
        new BigNumber(0)
      );
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
      !(
        isConnected &&
        borrowCapacity &&
        userSupplyBorrow &&
        marketConfiguration &&
        priceData?.prices
      )
    ) {
      return { title: '', value: 0 };
    }

    let updatedBorrowCapacity =
      borrowCapacity?.minus(
        BigNumber(1).div(
          priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
        )
      ) ?? BigNumber(0);

    updatedBorrowCapacity = updatedBorrowCapacity.lt(0)
      ? BigNumber(0)
      : updatedBorrowCapacity;

    // Borrowed + Available to Borrow
    if (userSupplyBorrow.borrowed.gt(0)) {
      // Available to Borrow
      if (borrowedMode === 0) {
        if (updatedBorrowCapacity.lt(1) && updatedBorrowCapacity.gt(0)) {
          return { title: 'Available to Borrow', value: updatedBorrowCapacity };
        }
        return {
          title: 'Available to Borrow',
          value: updatedBorrowCapacity,
        };
      }
      // Borrowed
      const val = formatUnits(
        userSupplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      ).plus(
        BigNumber(0.001).div(
          priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
        )
      );
      if (val.lt(1) && val.gt(0)) {
        return {
          title: 'Your Borrow Position',
          value: val,
        };
      }
      return {
        title: 'Your Borrow Position',
        value: val,
      };
    }
    // Available to borrow
    if (updatedBorrowCapacity.lt(1) && updatedBorrowCapacity.gt(0)) {
      return { title: 'Available to Borrow', value: updatedBorrowCapacity };
    }
    return {
      title: 'Available to Borrow',
      value: updatedBorrowCapacity,
    };
  }, [
    isConnected,
    borrowCapacity,
    userSupplyBorrow,
    borrowedMode,
    priceData,
    marketConfiguration,
  ]);

  return (
    <div className="w-full px-4 xl:px-[140px] 2xl:px-[203px]">
      <div className="flex h-[91px] w-full items-center justify-between rounded-xl border border-border bg-card px-[24px] sm:h-[123px] sm:px-[56px]">
        <div className="w-[300px]">
          {isConnected && (
            <div>
              <div className="font-semibold text-primary text-xs sm:text-md lg:text-lg">
                {marketMode === MARKET_MODE.BORROW
                  ? 'Your Supplied Collateral'
                  : `Your Supplied ${appConfig.client.shared.assets[marketConfiguration?.baseToken.bits ?? '']}`}
              </div>
              {isLoading ? (
                <Skeleton className="mt-2 h-[25px] w-[60%] bg-primary/20 sm:h-[40px]" />
              ) : (
                <div className="font-semibold text-lavender text-lg sm:text-xl lg:text-2xl">
                  {getFormattedPrice(totalSuppliedBalance ?? BigNumber(0))}
                </div>
              )}
            </div>
          )}
        </div>
        <InfoBowl />
        <div className="w-[300px] text-right">
          {isConnected && userSupplyBorrow && marketMode === 'borrow' && (
            <div>
              <div className="flex items-center justify-end gap-x-1 font-semibold text-primary text-xs sm:text-md lg:text-lg">
                {borrowedBalanceText.title}
                {userSupplyBorrow.borrowed.gt(0) && (
                  <button
                    className=""
                    onMouseDown={() => {
                      setBorrowedMode(borrowedMode === 0 ? 1 : 0);
                    }}
                    type="button"
                  >
                    <Repeat className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex w-full justify-end">
                  <Skeleton className="mt-2 h-[25px] w-[60%] bg-primary/20 sm:h-[40px]" />
                </div>
              ) : (
                <div className="font-semibold text-lavender text-lg sm:text-xl lg:text-2xl">
                  {getFormattedPrice(BigNumber(borrowedBalanceText.value))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
