import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { formatUnits, getFormattedPrice, SYMBOL_TO_ICON } from '@/utils';
import {
  useUserSupplyBorrow,
  usePrice,
  useUserCollateralAssets,
  useMarketConfiguration,
  useCollateralConfigurations,
  useUserCollateralUtilization,
  useApr,
  useBorrowCapacity,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import BigNumber from 'bignumber.js';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ACTION_TYPE,
  MARKET_MODE,
  selectChangeAction,
  selectChangeActionTokenAssetId,
  selectChangeInputDialogOpen,
  selectChangeMarket,
  selectChangeMarketMode,
  selectChangeTokenAmount,
  useMarketStore,
} from '@/stores';
import { MoveUpRightIcon } from 'lucide-react';

export const Markets = () => {
  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeActionTokenAssetId = useMarketStore(
    selectChangeActionTokenAssetId
  );
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);
  const changeMarketMode = useMarketStore(selectChangeMarketMode);
  const changeMarket = useMarketStore(selectChangeMarket);

  const handleBaseTokenClick = (
    action: ACTION_TYPE,
    assetId: string,
    market: string
  ) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeMarketMode(MARKET_MODE.BORROW);
    changeActionTokenAssetId(assetId);
    changeInputDialogOpen(true);
    changeMarket(market);
  };

  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePrice('USDC');

  const { data: userLiquidationPoint, isPending: isPendingLP } =
    useUserLiquidationPoint();

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
  const { data: aprDataUSDC, isPending: isAprPendingUSDC } = useApr('USDC');

  const currentCollateralUtilizationUSDC = useMemo(() => {
    return Number(collateralUtilizationUSDC?.times(100).toFixed(2));
  }, [collateralUtilizationUSDC]);

  const { data: borrowCapacity, isPending: isPendingBC } = useBorrowCapacity();

  const isLoading = useMemo(() => {
    return [
      isPendingCollateralConfigurationsUSDC,
      isPendingMarketConfigurationUSDC,
      isPendingUserCollateralAssetsUSDC,
      isPendingUserSupplyBorrowUSDC,
      isPendingPriceDataUSDC,
      isPendingColUtilUSDC,
      isAprPendingUSDC,
      isPendingLP,
      isPendingBC,
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
    isAprPendingUSDC,
    isPendingLP,
    isPendingBC,
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

  const marketType = useMemo(() => {
    if (totalBorrowedBaseAssets.gte(totalSuppliedBaseAssets)) {
      return 'Borrow';
    }
    return 'Earn';
  }, [totalBorrowedBaseAssets]);

  const apy = useMemo(() => {
    if (marketType === 'Borrow') {
      return aprDataUSDC?.borrowBaseApr.times(100).toFixed(2);
    }
    return aprDataUSDC?.supplyBaseApr.times(100).toFixed(2);
  }, [marketType, aprDataUSDC]);

  const rewardApy = useMemo(() => {
    if (marketType === 'Borrow') {
      return aprDataUSDC?.borrowRewardApr.times(100).toFixed(2);
    }
    return aprDataUSDC?.supplyRewardApr.times(100).toFixed(2);
  }, [marketType, aprDataUSDC]);

  const netApy = useMemo(() => {
    if (marketType === 'Borrow') {
      return aprDataUSDC?.netBorrowApr.times(100).toFixed(2);
    }
    return aprDataUSDC?.netSupplyApr.times(100).toFixed(2);
  }, [marketType, aprDataUSDC]);

  const LTV = useMemo(() => {
    if (marketType === 'Borrow') {
      return totalBorrowedBaseAssets
        .div(totalSuppliedCollateral)
        .times(100)
        .toFixed(2);
    }
    return 'N/A';
  }, [marketType, collateralUtilizationUSDC]);

  const healthFactor = useMemo(() => {
    if (marketType === 'Borrow') {
      return BigNumber(100).minus(LTV).toFixed(2);
    }
    return 'N/A';
  }, [marketType, collateralUtilizationUSDC]);

  const updatedBorrowCapacity = useMemo(() => {
    if (!marketConfigurationUSDC || !priceDataUSDC || !borrowCapacity) {
      return BigNumber(0);
    }
    let updatedBorrowCapacity = borrowCapacity?.minus(
      BigNumber(1).div(
        priceDataUSDC?.prices[marketConfigurationUSDC?.baseToken.bits ?? ''] ??
          1
      )
    );

    updatedBorrowCapacity = updatedBorrowCapacity?.lt(0)
      ? BigNumber(0)
      : updatedBorrowCapacity;

    return updatedBorrowCapacity;
  }, [marketConfigurationUSDC, borrowCapacity, priceDataUSDC]);

  return (
    <Card className="mt-8 w-full">
      <CardHeader className="bg-white/5 h-[20px] flex justify-center items-center text-md font-medium">
        <div className="flex gap-x-2 items-center">
          <Image
            src={SYMBOL_TO_ICON.USDC}
            alt={'USDC'}
            width={24}
            height={24}
            className={'rounded-full'}
          />{' '}
          USDC Market
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-16 pt-4">
        <div>
          <div className="flex justify-start gap-x-12">
            <div>
              <div className="text-md text-gray-400">Market Position</div>
              <div className="text-lg font-medium">{marketType}</div>
            </div>
            <div>
              <div className="text-md text-gray-400">APY</div>
              <div className="text-lg font-medium">{apy}%</div>
            </div>
            <div>
              <div className="text-md text-gray-400">Rewards APY</div>
              <div className="text-lg font-medium">{rewardApy}%</div>
            </div>
            <div>
              <div className="text-md text-gray-400">Points</div>
              <div className="text-lg font-medium">
                <Image
                  src={SYMBOL_TO_ICON.SWAY}
                  alt={'USDC'}
                  width={24}
                  height={24}
                  className={'rounded-full'}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-start gap-x-12 mt-8">
            <div>
              <div className="text-lg font-medium text-purple">
                My Borrowing
              </div>
              <div className="text-xl font-medium">
                {getFormattedPrice(totalBorrowedBaseAssets)}
              </div>
            </div>
            <div>
              <div className="text-lg font-medium text-gray-400">
                My Collateral
              </div>
              <div className="text-xl font-medium">
                {getFormattedPrice(totalSuppliedCollateral)}
              </div>
            </div>
            <div>
              <div className="text-lg font-medium text-primary">My Earning</div>
              <div className="text-xl font-medium">
                {getFormattedPrice(totalSuppliedBaseAssets)}
              </div>
            </div>
          </div>
          {marketType === 'Borrow' && (
            <div className="mt-8">
              <div className="flex justify-between items-end px-4 p-2 text-lg font-medium text-lavender">
                <div>Risk Meter</div>
                {!isLoading && (
                  <div
                    className={`text-lg font-semibold ${riskMeter > 80 && 'text-red-500'} ${riskMeter > 60 && riskMeter <= 80 && 'text-yellow-500'} ${riskMeter <= 60 && 'text-primary'}`}
                  >
                    {riskMeter}%
                  </div>
                )}
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="w-full h-[45px] rounded-full bg-primary/20" />
                </>
              ) : (
                <div className="w-full h-[45px] rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full w-full flex-1 transition-all rounded-full',
                      `${riskMeter > 80 && 'bg-red-500'} ${riskMeter > 60 && riskMeter <= 80 && 'bg-yellow-500'} ${riskMeter <= 60 && 'bg-primary'}`
                    )}
                    style={{
                      transform: `translateX(-${100 - (riskMeter || 0)}%)`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="">
          {marketType === 'Borrow' && (
            <div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Available to Borrow</div>
                <div className="text-white font-medium">
                  {getFormattedPrice(updatedBorrowCapacity)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Loan to Value (LTV)</div>
                <div className="text-white font-medium">{LTV}%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Health Factor</div>
                <div className="text-white font-medium">{healthFactor}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Liquidation Point</div>
                <div className="text-white font-medium">
                  {getFormattedPrice(userLiquidationPoint ?? BigNumber(0))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Net APY</div>
                <div className="text-white font-medium">{netApy}%</div>
              </div>
              <div className="flex w-full justify-end">
                <Link href="/" className="mt-4">
                  <Button
                    size={'sm'}
                    onMouseDown={() => {
                      handleBaseTokenClick(
                        ACTION_TYPE.BORROW,
                        marketConfigurationUSDC?.baseToken.bits ?? '',
                        'USDC'
                      );
                    }}
                  >
                    Open Market
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {marketType === 'Earn' && (
            <div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Net APY</div>
                <div className="text-white font-medium">{netApy}%</div>
              </div>
              <div className="flex w-full justify-end">
                <Link href="/" className="mt-4">
                  <Button
                    size={'sm'}
                    onMouseDown={() => {
                      handleBaseTokenClick(
                        ACTION_TYPE.SUPPLY,
                        marketConfigurationUSDC?.baseToken.bits ?? '',
                        'USDC'
                      );
                    }}
                  >
                    Open Market
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
