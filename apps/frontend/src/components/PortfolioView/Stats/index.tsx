import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserSupplyBorrow,
} from '@/hooks';
import { cn } from '@/lib/utils';
import { formatUnits, getFormattedPrice } from '@/utils';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

export const Stats = () => {
  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const {
    data: userSupplyBorrowUSDT,
    isPending: isPendingUserSupplyBorrowUSDT,
  } = useUserSupplyBorrow('USDT');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePrice('USDC');
  const { data: priceDataUSDT, isPending: isPendingPriceDataUSDT } =
    usePrice('USDT');

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

  const {
    data: userCollateralAssetsUSDT,
    isPending: isPendingUserCollateralAssetsUSDT,
  } = useUserCollateralAssets('USDT');
  const {
    data: marketConfigurationUSDT,
    isPending: isPendingMarketConfigurationUSDT,
  } = useMarketConfiguration('USDT');
  const {
    data: colateralConfigurationsUSDT,
    isPending: isPendingCollateralConfigurationsUSDT,
  } = useCollateralConfigurations('USDT');

  const { data: collateralUtilizationUSDC, isPending: isPendingColUtilUSDC } =
    useUserCollateralUtilization('USDC');
  const { data: collateralUtilizationUSDT, isPending: isPendingColUtilUSDT } =
    useUserCollateralUtilization('USDT');

  const currentCollateralUtilizationUSDC = useMemo(() => {
    return Number(collateralUtilizationUSDC?.times(100).toFixed(2));
  }, [collateralUtilizationUSDC]);

  const currentCollateralUtilizationUSDT = useMemo(() => {
    return Number(collateralUtilizationUSDT?.times(100).toFixed(2));
  }, [collateralUtilizationUSDT]);

  const isLoading = useMemo(() => {
    return [
      isPendingCollateralConfigurationsUSDT,
      isPendingMarketConfigurationUSDT,
      isPendingUserCollateralAssetsUSDT,
      isPendingCollateralConfigurationsUSDC,
      isPendingMarketConfigurationUSDC,
      isPendingUserCollateralAssetsUSDC,
      isPendingUserSupplyBorrowUSDT,
      isPendingUserSupplyBorrowUSDC,
      isPendingPriceDataUSDC,
      isPendingPriceDataUSDT,
    ].some((res) => res);
  }, [
    isPendingCollateralConfigurationsUSDT,
    isPendingMarketConfigurationUSDT,
    isPendingUserCollateralAssetsUSDT,
    isPendingCollateralConfigurationsUSDC,
    isPendingMarketConfigurationUSDC,
    isPendingUserCollateralAssetsUSDC,
    isPendingUserSupplyBorrowUSDT,
    isPendingUserSupplyBorrowUSDC,
    isPendingPriceDataUSDC,
    isPendingPriceDataUSDT,
  ]);

  const riskMeter = useMemo(() => {
    return Math.max(
      currentCollateralUtilizationUSDC,
      currentCollateralUtilizationUSDT
    );
  }, [currentCollateralUtilizationUSDC, currentCollateralUtilizationUSDT]);

  const totalSuppliedCollateral = useMemo(() => {
    if (
      !priceDataUSDC ||
      !priceDataUSDT ||
      !userCollateralAssetsUSDC ||
      !userCollateralAssetsUSDT ||
      !colateralConfigurationsUSDC ||
      !colateralConfigurationsUSDT
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
    const suppliedCollateralUSDT = Object.entries(
      userCollateralAssetsUSDT
    ).reduce((acc, [key, value]) => {
      return acc.plus(
        formatUnits(
          value.times(priceDataUSDT.prices[key]),
          colateralConfigurationsUSDT[key].decimals
        )
      );
    }, new BigNumber(0));
    return suppliedCollateralUSDC.plus(suppliedCollateralUSDT);
  }, [
    priceDataUSDC,
    priceDataUSDT,
    userCollateralAssetsUSDC,
    userCollateralAssetsUSDT,
    colateralConfigurationsUSDC,
    colateralConfigurationsUSDT,
  ]);

  const totalSuppliedBaseAssets = useMemo(() => {
    if (
      !marketConfigurationUSDC ||
      !marketConfigurationUSDT ||
      !priceDataUSDC ||
      !priceDataUSDT ||
      !userSupplyBorrowUSDC ||
      !userSupplyBorrowUSDT
    )
      return BigNumber(0);

    // Get supplied USDC
    const suppliedUSDC = formatUnits(
      userSupplyBorrowUSDC.supplied,
      marketConfigurationUSDC.baseTokenDecimals
    );
    // Get supplied USDT
    const suppliedUSDT = formatUnits(
      userSupplyBorrowUSDT.supplied,
      marketConfigurationUSDT.baseTokenDecimals
    );
    return suppliedUSDC.plus(suppliedUSDT);
  }, [
    marketConfigurationUSDC,
    marketConfigurationUSDT,
    priceDataUSDC,
    priceDataUSDT,
    userSupplyBorrowUSDC,
    userSupplyBorrowUSDT,
  ]);

  const totalBorrowedBaseAssets = useMemo(() => {
    if (
      !marketConfigurationUSDC ||
      !marketConfigurationUSDT ||
      !priceDataUSDC ||
      !priceDataUSDT ||
      !userSupplyBorrowUSDC ||
      !userSupplyBorrowUSDT
    )
      return BigNumber(0);

    // Get borrowed USDC
    const borrowedUSDC = formatUnits(
      userSupplyBorrowUSDC.borrowed,
      marketConfigurationUSDC.baseTokenDecimals
    );
    // Get borrowed USDT
    const borrowedUSDT = formatUnits(
      userSupplyBorrowUSDT.borrowed,
      marketConfigurationUSDT.baseTokenDecimals
    );
    return borrowedUSDC.plus(borrowedUSDT);
  }, [
    marketConfigurationUSDC,
    marketConfigurationUSDT,
    priceDataUSDC,
    priceDataUSDT,
    userSupplyBorrowUSDC,
    userSupplyBorrowUSDT,
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
    <div className="flex justify-between items-center">
      <div>
        <div className="flex flex-col justify-end">
          <div className="text-moon text-sm font-semibold">Total Assets</div>
          <div className="text-white font-bold text-2xl">
            {getFormattedPrice(totalSuppliedBalance ?? BigNumber(0))}
          </div>
        </div>
        <div className="mt-8 flex w-full justify-between">
          <div className="flex items-end gap-x-16">
            <div>
              <div className="flex gap-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-purple" />
                <div className="text-sm font-semibold text-purple">Earning</div>
              </div>
              <div className="text-white font-bold text-xl">
                {getFormattedPrice(totalSuppliedBaseAssets ?? BigNumber(0))}
              </div>
            </div>
            <div>
              <div className="flex gap-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="text-sm font-semibold text-primary">
                  Borrowing{' '}
                </div>
              </div>
              <div className="text-white font-bold text-xl">
                {getFormattedPrice(totalBorrowedBaseAssets ?? BigNumber(0))}
              </div>
            </div>
            <div>
              <div className="flex gap-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-[#918E8E]" />
                <div className="text-moon text-sm font-semibold">
                  Collateral
                </div>
              </div>
              <div className="text-white font-bold text-xl">
                {getFormattedPrice(totalSuppliedCollateral ?? BigNumber(0))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-end px-4 p-2 text-lg font-medium text-lavender">
          <div>Risk Meter</div>
          <div
            className={`text-xl font-semibold ${riskMeter > 80 && 'text-red-500'} ${riskMeter > 60 && riskMeter <= 80 && 'text-yellow-500'} ${riskMeter <= 60 && 'text-primary'}`}
          >
            {riskMeter}%
          </div>
        </div>
        <div className="w-[33vw] max-w-[500px] h-[60px] rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn(
              'h-full w-full flex-1 transition-all rounded-full',
              `${riskMeter > 80 && 'bg-red-500'} ${riskMeter > 60 && riskMeter <= 80 && 'bg-yellow-500'} ${riskMeter <= 60 && 'bg-primary'}`
            )}
            style={{ transform: `translateX(-${100 - (riskMeter || 0)}%)` }}
          />
        </div>
      </div>
    </div>
  );
};
