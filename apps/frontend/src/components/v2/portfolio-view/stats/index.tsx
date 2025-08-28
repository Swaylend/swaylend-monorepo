import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePriceData,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { formatUnits, getFormattedPrice } from '@/utils';
import { Chart } from './chart';

export const Stats = () => {
  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePriceData('USDC');

  const {
    data: userCollateralAssetsUSDC,
    isPending: isPendingUserCollateralAssetsUSDC,
  } = useUserCollateralAssets('USDC');
  const {
    data: marketConfigurationUSDC,
    isPending: isPendingMarketConfigurationUSDC,
  } = useMarketConfiguration('USDC');
  const {
    data: colateralConfigurationsUSDC,
    isPending: isPendingCollateralConfigurationsUSDC,
  } = useCollateralConfigurations('USDC');
  const { data: collateralUtilizationUSDC, isPending: isPendingColUtilUSDC } =
    useUserCollateralUtilization('USDC');

  // const {
  //   data: userSupplyBorrowUSDT,
  //   isPending: isPendingUserSupplyBorrowUSDT,
  // } = useUserSupplyBorrow('USDT');
  // const { data: priceDataUSDT, isPending: isPendingPriceDataUSDT } =
  //   usePrice('USDT');
  // const {
  //   data: userCollateralAssetsUSDT,
  //   isPending: isPendingUserCollateralAssetsUSDT,
  // } = useUserCollateralAssets('USDT');
  // const {
  //   data: marketConfigurationUSDT,
  //   isPending: isPendingMarketConfigurationUSDT,
  // } = useMarketConfiguration('USDT');
  // const {
  //   data: colateralConfigurationsUSDT,
  //   isPending: isPendingCollateralConfigurationsUSDT,
  // } = useCollateralConfigurations('USDT');

  // const { data: collateralUtilizationUSDT, isPending: isPendingColUtilUSDT } =
  //   useUserCollateralUtilization('USDT');

  const currentCollateralUtilizationUSDC = useMemo(() => {
    return Number(collateralUtilizationUSDC?.times(100).toFixed(2));
  }, [collateralUtilizationUSDC]);

  // const currentCollateralUtilizationUSDT = useMemo(() => {
  //   return Number(collateralUtilizationUSDT?.times(100).toFixed(2));
  // }, [collateralUtilizationUSDT]);

  const isLoading = useMemo(() => {
    return [
      isPendingCollateralConfigurationsUSDC,
      isPendingMarketConfigurationUSDC,
      isPendingUserCollateralAssetsUSDC,
      isPendingUserSupplyBorrowUSDC,
      isPendingPriceDataUSDC,
      isPendingColUtilUSDC,
      // isPendingCollateralConfigurationsUSDT,
      // isPendingMarketConfigurationUSDT,
      // isPendingUserCollateralAssetsUSDT,
      // isPendingUserSupplyBorrowUSDT,
      // isPendingPriceDataUSDT,
      // isPendingColUtilUSDT,
    ].some((res) => res);
  }, [
    isPendingCollateralConfigurationsUSDC,
    isPendingMarketConfigurationUSDC,
    isPendingUserCollateralAssetsUSDC,
    isPendingUserSupplyBorrowUSDC,
    isPendingPriceDataUSDC,
    isPendingColUtilUSDC,
    // isPendingCollateralConfigurationsUSDT,
    // isPendingMarketConfigurationUSDT,
    // isPendingUserCollateralAssetsUSDT,
    // isPendingUserSupplyBorrowUSDT,
    // isPendingPriceDataUSDT,
    // isPendingColUtilUSDT,
  ]);

  const _riskMeter = useMemo(() => {
    return Math.max(
      currentCollateralUtilizationUSDC
      // currentCollateralUtilizationUSDT
    );
  }, [currentCollateralUtilizationUSDC /*, currentCollateralUtilizationUSDT*/]);

  const totalSuppliedCollateral = useMemo(() => {
    if (
      !(
        priceDataUSDC &&
        userCollateralAssetsUSDC &&
        colateralConfigurationsUSDC
      )
      // || !colateralConfigurationsUSDT
    )
      return BigNumber(0);

    // Get supplied assets for USDC
    const suppliedCollateralUSDC = Object.entries(
      userCollateralAssetsUSDC
    ).reduce((acc, [key, value]) => {
      return acc.plus(
        formatUnits(
          value.times(
            priceDataUSDC.prices.get(key)?.[0]?.price ?? BigNumber(0)
          ),
          colateralConfigurationsUSDC[key].decimals
        )
      );
    }, new BigNumber(0));
    // Get supplied assets for USDT
    // const suppliedCollateralUSDT = Object.entries(
    //   userCollateralAssetsUSDT
    // ).reduce((acc, [key, value]) => {
    //   return acc.plus(
    //     formatUnits(
    //       value.times(priceDataUSDT.prices[key]),
    //       colateralConfigurationsUSDT[key].decimals
    //     )
    //   );
    // }, new BigNumber(0));
    // return suppliedCollateralUSDC.plus(suppliedCollateralUSDT);

    return suppliedCollateralUSDC;
  }, [
    priceDataUSDC,
    userCollateralAssetsUSDC,
    colateralConfigurationsUSDC,
    // priceDataUSDT,
    // userCollateralAssetsUSDT,
    // colateralConfigurationsUSDT,
  ]);

  const totalSuppliedBaseAssets = useMemo(() => {
    if (
      !(marketConfigurationUSDC && priceDataUSDC && userSupplyBorrowUSDC)
      // || !userSupplyBorrowUSDT
    )
      return BigNumber(0);

    // Get supplied USDC
    const suppliedUSDC = formatUnits(
      userSupplyBorrowUSDC.supplied,
      marketConfigurationUSDC.baseTokenDecimals
    );
    // Get supplied USDT
    // const suppliedUSDT = formatUnits(
    //   userSupplyBorrowUSDT.supplied,
    //   marketConfigurationUSDT.baseTokenDecimals
    // );
    //return suppliedUSDC.plus(suppliedUSDT);
    return suppliedUSDC;
  }, [
    marketConfigurationUSDC,
    // marketConfigurationUSDT,
    priceDataUSDC,
    // priceDataUSDT,
    userSupplyBorrowUSDC,
    // userSupplyBorrowUSDT,
  ]);

  const totalBorrowedBaseAssets = useMemo(() => {
    if (
      !(marketConfigurationUSDC && priceDataUSDC && userSupplyBorrowUSDC)
      // || !userSupplyBorrowUSDT
    )
      return BigNumber(0);

    // Get borrowed USDC
    const borrowedUSDC = formatUnits(
      userSupplyBorrowUSDC.borrowed,
      marketConfigurationUSDC.baseTokenDecimals
    );
    // Get borrowed USDT
    // const borrowedUSDT = formatUnits(
    //   userSupplyBorrowUSDT.borrowed,
    //   marketConfigurationUSDT.baseTokenDecimals
    // );
    // return borrowedUSDC.plus(borrowedUSDT);
    return borrowedUSDC;
  }, [
    marketConfigurationUSDC,
    // marketConfigurationUSDT,
    priceDataUSDC,
    // priceDataUSDT,
    userSupplyBorrowUSDC,
    // userSupplyBorrowUSDT,
  ]);

  const totalSuppliedBalance = useMemo(() => {
    if (
      totalSuppliedCollateral === undefined ||
      totalSuppliedBaseAssets === undefined
    )
      return BigNumber(0);

    return totalSuppliedCollateral.plus(totalSuppliedBaseAssets);
  }, [totalSuppliedCollateral, totalSuppliedBaseAssets]);

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
                    {getFormattedPrice(totalSuppliedBaseAssets ?? BigNumber(0))}
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
                    {getFormattedPrice(totalBorrowedBaseAssets ?? BigNumber(0))}
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
                    {getFormattedPrice(totalSuppliedCollateral ?? BigNumber(0))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Chart
          lastRow={{
            timestamp: Math.floor(Date.now() / 1000),
            suppliedAmountUsd: totalSuppliedBaseAssets.toFixed(2),
            borrowedAmountUsd: totalBorrowedBaseAssets.toFixed(2),
            collateralAmountUsd: totalSuppliedCollateral.toFixed(2),
          }}
        />
      </div>
    </div>
  );
};
