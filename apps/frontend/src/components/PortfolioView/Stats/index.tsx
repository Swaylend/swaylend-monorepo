import { Skeleton } from '@/components/ui/skeleton';
import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserSupplyBorrow,
} from '@/hooks';
import { formatUnits, getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { Chart } from './Chart';

export const Stats = () => {
  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePrice('USDC');

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

  const riskMeter = useMemo(() => {
    return Math.max(
      currentCollateralUtilizationUSDC
      // currentCollateralUtilizationUSDT
    );
  }, [currentCollateralUtilizationUSDC /*, currentCollateralUtilizationUSDT*/]);

  const totalSuppliedCollateral = useMemo(() => {
    if (
      !priceDataUSDC ||
      // !priceDataUSDT ||
      !userCollateralAssetsUSDC ||
      // !userCollateralAssetsUSDT ||
      !colateralConfigurationsUSDC
      // || !colateralConfigurationsUSDT
    )
      return BigNumber(0);

    // Get supplied assets for USDC
    const suppliedCollateralUSDC = Object.entries(
      userCollateralAssetsUSDC
    ).reduce((acc, [key, value]) => {
      return acc.plus(
        formatUnits(
          value.times(priceDataUSDC.prices[key]),
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
      !marketConfigurationUSDC ||
      // !marketConfigurationUSDT ||
      !priceDataUSDC ||
      // !priceDataUSDT ||
      !userSupplyBorrowUSDC
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
      !marketConfigurationUSDC ||
      // !marketConfigurationUSDT ||
      !priceDataUSDC ||
      // !priceDataUSDT ||
      !userSupplyBorrowUSDC
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
      <div className="flex justify-between items-center gap-x-16">
        <div className="w-1/2">
          <div className="flex flex-col justify-end">
            <div className="text-moon text-sm font-semibold">Total Assets</div>
            {isLoading ? (
              <>
                <Skeleton className="w-[240px] h-[60px] bg-primary/20 rounded-md" />
              </>
            ) : (
              <div className="text-white font-bold text-2xl">
                {getFormattedPrice(totalSuppliedBalance ?? BigNumber(0))}
              </div>
            )}
          </div>
          <div className="mt-8 flex w-full justify-between">
            <div className="flex items-end gap-x-16">
              <div>
                <div className="flex gap-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-purple" />
                  <div className="text-sm font-semibold text-purple">
                    Earning
                  </div>
                </div>
                {isLoading ? (
                  <>
                    <Skeleton className="w-[100px] h-[40px] rounded-md bg-primary/20" />
                  </>
                ) : (
                  <div className="text-white font-bold text-xl">
                    {getFormattedPrice(totalSuppliedBaseAssets ?? BigNumber(0))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex gap-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="text-sm font-semibold text-primary">
                    Borrowing{' '}
                  </div>
                </div>
                {isLoading ? (
                  <>
                    <Skeleton className="w-[100px] h-[40px] rounded-md bg-primary/20" />
                  </>
                ) : (
                  <div className="text-white font-bold text-xl">
                    {getFormattedPrice(totalBorrowedBaseAssets ?? BigNumber(0))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex gap-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
                  <div className="text-moon text-sm font-semibold">
                    Collateral
                  </div>
                </div>

                {isLoading ? (
                  <>
                    <Skeleton className="w-[100px] h-[40px] rounded-md bg-primary/20" />
                  </>
                ) : (
                  <div className="text-white font-bold text-xl">
                    {getFormattedPrice(totalSuppliedCollateral ?? BigNumber(0))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Chart />
      </div>
    </div>
  );
};
