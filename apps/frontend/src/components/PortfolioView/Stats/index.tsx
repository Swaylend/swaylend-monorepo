import {
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks';
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
    <div className="flex justify-between">
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
            <div>
              <div className="flex gap-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="text-red-500 text-sm font-semibold">Debt</div>
              </div>
              <div className="text-white font-bold text-xl">123</div>
            </div>
          </div>
        </div>
      </div>
      <div>Risk Meter</div>
    </div>
  );
};
