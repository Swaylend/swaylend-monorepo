import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { appConfig } from '@/configs';
import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePriceData,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { formatUnits, getFormattedPrice } from '@/utils';
import { Chart } from './chart';

const statsPerMarket = (market: string) => {
  const { data: userSupplyBorrow, isPending: isPendingUserSupplyBorrow } =
    useUserSupplyBorrow(market);
  const { data: priceData, isPending: isPendingPriceData } =
    usePriceData(market);

  const {
    data: userCollateralAssets,
    isPending: isPendingUserCollateralAssets,
  } = useUserCollateralAssets(market);
  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration(market);
  const {
    data: colateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations(market);

  const isLoading = useMemo(() => {
    return [
      isPendingCollateralConfigurations,
      isPendingMarketConfiguration,
      isPendingUserCollateralAssets,
      isPendingUserSupplyBorrow,
      isPendingPriceData,
    ].some((res) => res);
  }, [
    isPendingCollateralConfigurations,
    isPendingMarketConfiguration,
    isPendingUserCollateralAssets,
    isPendingUserSupplyBorrow,
    isPendingPriceData,
  ]);

  const totalSuppliedCollateralValue = useMemo(() => {
    if (!(priceData && userCollateralAssets && colateralConfigurations))
      return BigNumber(0);

    const suppliedCollateral = Object.entries(userCollateralAssets).reduce(
      (acc, [key, value]) => {
        return acc.plus(
          formatUnits(
            value.times(priceData.prices.get(key)?.[0]?.price ?? BigNumber(0)),
            colateralConfigurations[key].decimals
          )
        );
      },
      new BigNumber(0)
    );

    return suppliedCollateral;
  }, [priceData, userCollateralAssets, colateralConfigurations]);

  const totalSuppliedBaseAssetValue = useMemo(() => {
    if (!(marketConfiguration && priceData && userSupplyBorrow))
      return BigNumber(0);

    const supplied = formatUnits(
      userSupplyBorrow.supplied.times(
        priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]?.price ??
          BigNumber(0)
      ),
      marketConfiguration.baseTokenDecimals
    );

    return supplied;
  }, [marketConfiguration, priceData, userSupplyBorrow]);

  const totalBorrowedBaseAssetValue = useMemo(() => {
    if (!(marketConfiguration && priceData && userSupplyBorrow))
      return BigNumber(0);

    const borrowed = formatUnits(
      userSupplyBorrow.borrowed.times(
        priceData.prices.get(marketConfiguration.baseToken.bits)?.[0]?.price ??
          BigNumber(0)
      ),
      marketConfiguration.baseTokenDecimals
    );

    return borrowed;
  }, [marketConfiguration, priceData, userSupplyBorrow]);

  const totalSuppliedBalance = useMemo(() => {
    if (
      totalSuppliedCollateralValue === undefined ||
      totalSuppliedBaseAssetValue === undefined
    )
      return BigNumber(0);

    return totalSuppliedCollateralValue.plus(totalSuppliedBaseAssetValue);
  }, [totalSuppliedCollateralValue, totalSuppliedBaseAssetValue]);

  if (!Object.keys(appConfig.client.v2.markets).includes(market)) {
    return {
      isLoading: false,
      totalSuppliedCollateralValue: BigNumber(0),
      totalSuppliedBaseAssetValue: BigNumber(0),
      totalBorrowedBaseAssetValue: BigNumber(0),
      totalSuppliedBalance: BigNumber(0),
    };
  }

  return {
    isLoading,
    totalSuppliedCollateralValue,
    totalSuppliedBaseAssetValue,
    totalBorrowedBaseAssetValue,
    totalSuppliedBalance,
  };
};

export const Stats = () => {
  // NOTE: If we add another market, we need to add it here.
  const {
    isLoading: isLoadingUSDC,
    totalSuppliedBalance: totalSuppliedBalanceUSDC,
    totalSuppliedCollateralValue: totalSuppliedCollateralValueUSDC,
    totalSuppliedBaseAssetValue: totalSuppliedBaseAssetValueUSDC,
    totalBorrowedBaseAssetValue: totalBorrowedBaseAssetValueUSDC,
  } = statsPerMarket('ETH');

  const {
    isLoading: isLoadingUSDT,
    totalSuppliedBalance: totalSuppliedBalanceUSDT,
    totalSuppliedCollateralValue: totalSuppliedCollateralValueUSDT,
    totalSuppliedBaseAssetValue: totalSuppliedBaseAssetValueUSDT,
    totalBorrowedBaseAssetValue: totalBorrowedBaseAssetValueUSDT,
  } = statsPerMarket('USDT');

  // Calculate the total supplied balance
  const isLoading = isLoadingUSDC || isLoadingUSDT;
  const totalSuppliedBalance = totalSuppliedBalanceUSDC.plus(
    totalSuppliedBalanceUSDT
  );
  const totalSuppliedCollateralValue = totalSuppliedCollateralValueUSDC.plus(
    totalSuppliedCollateralValueUSDT
  );
  const totalSuppliedBaseAssetValue = totalSuppliedBaseAssetValueUSDC.plus(
    totalSuppliedBaseAssetValueUSDT
  );
  const totalBorrowedBaseAssetValue = totalBorrowedBaseAssetValueUSDC.plus(
    totalBorrowedBaseAssetValueUSDT
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-x-10">
        <div className="flex h-[240px] w-3/5 flex-col xl:w-1/2">
          <div className="flex flex-1 flex-col items-start justify-start">
            <div className="font-semibold text-moon text-sm">Total Assets</div>
            {isLoading ? (
              <Skeleton className="h-[60px] w-[240px] rounded-md bg-primary/20" />
            ) : (
              <div className="font-bold text-2xl text-white">
                {getFormattedPrice(totalSuppliedBalance ?? BigNumber(0))}
              </div>
            )}
          </div>
          <div className="flex w-full justify-between pb-9">
            <div className="flex w-full items-end gap-x-8">
              <div>
                <div className="flex items-center gap-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="font-semibold text-primary text-sm">
                    Earning
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-[40px] w-[100px] rounded-md bg-primary/20" />
                ) : (
                  <div className="font-bold text-[22px] text-white 2xl:text-xl">
                    {getFormattedPrice(
                      totalSuppliedBaseAssetValue ?? BigNumber(0)
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <div className="h-2 w-2 rounded-full bg-purple" />
                  <div className="font-semibold text-purple text-sm">
                    Borrowing{' '}
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-[40px] w-[100px] rounded-md bg-primary/20" />
                ) : (
                  <div className="font-bold text-[22px] text-white 2xl:text-xl">
                    {getFormattedPrice(
                      totalBorrowedBaseAssetValue ?? BigNumber(0)
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <div className="h-2 w-2 rounded-full bg-[#918E8E]" />
                  <div className="font-semibold text-moon text-sm">
                    Collateral
                  </div>
                </div>

                {isLoading ? (
                  <Skeleton className="h-[40px] w-[100px] rounded-md bg-primary/20" />
                ) : (
                  <div className="font-bold text-[22px] text-white 2xl:text-xl">
                    {getFormattedPrice(
                      totalSuppliedCollateralValue ?? BigNumber(0)
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Chart
          lastRow={{
            timestamp: Math.floor(Date.now() / 1000),
            suppliedAmountUsd: totalSuppliedBaseAssetValue.toFixed(2),
            borrowedAmountUsd: totalBorrowedBaseAssetValue.toFixed(2),
            collateralAmountUsd: totalSuppliedCollateralValue.toFixed(2),
          }}
        />
      </div>
    </div>
  );
};
