import BigNumber from 'bignumber.js';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoIcon } from '@/components/v2/info-icon';
import {
  useApr,
  useBorrowCapacity,
  useCollateralConfigurations,
  useHealthFactor,
  useLTV,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserLiquidationPoint,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { cn } from '@/lib/utils';
import {
  ACTION_TYPE,
  MARKET_MODE,
  useMarketStore,
} from '@/stores/market-store';
import { formatUnits, getFormattedPrice, SYMBOL_TO_ICON } from '@/utils';

export const Markets = () => {
  const changeAction = useMarketStore.use.changeAction();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeActionTokenAssetId =
    useMarketStore.use.changeActionTokenAssetId();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();
  const changeMarketMode = useMarketStore.use.changeMarketMode();
  const changeMarket = useMarketStore.use.changeMarket();

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
  const { data: healthFactorUSDC, isPending: isPendingHealthFactorUSDC } =
    useHealthFactor('USDC');
  const { data: ltvUSDC, isPending: isPendingLTVUSDC } = useLTV('USDC');

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
    isPendingHealthFactorUSDC,
    isPendingLTVUSDC,
  ]);

  const riskMeter = useMemo(() => {
    return Math.max(currentCollateralUtilizationUSDC);
  }, [currentCollateralUtilizationUSDC]);

  const totalSuppliedCollateral = useMemo(() => {
    if (
      !(
        priceDataUSDC &&
        userCollateralAssetsUSDC &&
        colateralConfigurationsUSDC
      )
    )
      return BigNumber(0);

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

    return suppliedCollateralUSDC;
  }, [priceDataUSDC, userCollateralAssetsUSDC, colateralConfigurationsUSDC]);

  const totalSuppliedBaseAssets = useMemo(() => {
    if (!(marketConfigurationUSDC && priceDataUSDC && userSupplyBorrowUSDC))
      return BigNumber(0);

    const suppliedUSDC = formatUnits(
      userSupplyBorrowUSDC.supplied,
      marketConfigurationUSDC.baseTokenDecimals
    );

    return suppliedUSDC;
  }, [marketConfigurationUSDC, priceDataUSDC, userSupplyBorrowUSDC]);

  const totalBorrowedBaseAssets = useMemo(() => {
    if (!(marketConfigurationUSDC && priceDataUSDC && userSupplyBorrowUSDC))
      return BigNumber(0);

    const borrowedUSDC = formatUnits(
      userSupplyBorrowUSDC.borrowed,
      marketConfigurationUSDC.baseTokenDecimals
    );

    return borrowedUSDC;
  }, [marketConfigurationUSDC, priceDataUSDC, userSupplyBorrowUSDC]);

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

  const updatedBorrowCapacity = useMemo(() => {
    if (!(marketConfigurationUSDC && priceDataUSDC && borrowCapacity)) {
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
      <CardHeader className="flex h-[48px] items-center justify-center bg-white/5 font-medium text-md">
        <div className="flex items-center gap-x-2">
          <Image
            alt={'USDC'}
            className="min-h-[24px] min-w-[24px] rounded-full"
            height={24}
            src={SYMBOL_TO_ICON.USDC}
            width={24}
          />{' '}
          USDC Market
        </div>
      </CardHeader>
      <CardContent className="flex justify-between gap-x-16">
        <div>
          <div className="flex justify-start gap-x-7">
            <div>
              <div className="text-gray-400 text-md">Market Position</div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 bg-white/5" />
              ) : (
                <div
                  className={`text-lg ${marketType === 'Earn' ? 'text-primary' : 'text-purple'}`}
                >
                  {marketType}
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-400 text-md">APY</div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 bg-white/5" />
              ) : (
                <div
                  className={`text-lg ${marketType === 'Earn' ? 'text-primary' : 'text-purple'}`}
                >
                  {apy}%
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-400 text-md">Rewards APY</div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 bg-white/5" />
              ) : (
                <div className="font-medium text-lg text-primary">
                  {rewardApy}%
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-400 text-md">Points</div>
              <div className="flex justify-center font-medium text-lg">
                <Image
                  alt={'USDC'}
                  className={'rounded-full'}
                  height={24}
                  src={SYMBOL_TO_ICON.SWAY}
                  width={24}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-start gap-x-12">
            <div>
              <div className="font-medium text-md text-purple">
                My Borrowing
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-24 bg-white/5" />
              ) : (
                <div className="font-medium text-[24px]">
                  {getFormattedPrice(totalBorrowedBaseAssets)}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-400 text-md">
                My Collateral
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-24 bg-white/5" />
              ) : (
                <div className="font-medium text-[24px]">
                  {getFormattedPrice(totalSuppliedCollateral)}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-md text-primary">My Earning</div>
              {isLoading ? (
                <Skeleton className="h-7 w-24 bg-white/5" />
              ) : (
                <div className="font-medium text-[24px]">
                  {getFormattedPrice(totalSuppliedBaseAssets)}
                </div>
              )}
            </div>
          </div>
          {marketType === 'Borrow' && (
            <div className="mt-8">
              <div className="flex items-end justify-between p-2 px-4 font-medium text-lavender text-lg">
                <div>Risk Meter</div>
                {!isLoading && (
                  <div
                    className={`font-semibold text-lg ${riskMeter > 80 && 'text-red-500'} ${riskMeter > 60 && riskMeter <= 80 && 'text-yellow-500'} ${riskMeter <= 60 && 'text-primary'}`}
                  >
                    {riskMeter}%
                  </div>
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-[45px] w-full rounded-full bg-white/5" />
              ) : (
                <div className="h-[45px] w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn(
                      'h-full w-full flex-1 rounded-full transition-all',
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

        <div className="w-full max-w-[320px]">
          {marketType === 'Borrow' && (
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col gap-y-[5px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1 text-white">
                    Available to Borrow{' '}
                    <InfoIcon text="Amount available to borrow based on your deposited collateral represented in USD." />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 bg-white/5" />
                  ) : (
                    <div className="font-medium text-white">
                      {getFormattedPrice(updatedBorrowCapacity)}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1 text-white">
                    Loan to Value (LTV){' '}
                    <InfoIcon text="Show the amount of loan you can secure using your crypto as collateral. LTV is calculated by dividing the amount of credit you have borrowed by the value of your collateral, expressed as a percentage." />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-white/5" />
                  ) : (
                    <div className="font-medium text-white">
                      {ltvUSDC?.times(100).toFixed(2)}%
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1 text-white">
                    Health Factor{' '}
                    <InfoIcon text="Collateralization status of a position, defined as the ratio of the borrowing capacity over the outstanding debts. The higher the value is, the safer the state of your funds. If the health factor reaches 1, the liquidation of your collateral will be triggered." />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-white/5" />
                  ) : (
                    <div className={'font-medium text-primary'}>
                      {healthFactorUSDC?.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1 text-white">
                    Liquidation Point
                    <InfoIcon text="Total value of supplied collateral at which your position will be liquidated represented in USD." />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 bg-white/5" />
                  ) : (
                    <div className="font-medium text-white">
                      {getFormattedPrice(userLiquidationPoint ?? BigNumber(0))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1 text-white">
                    Net APY
                    <InfoIcon
                      text="Net APY represents the total of Borrow APY and Reward APY, calculated as follows: Net APY = Borrow APY - Reward APY.
"
                    />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-white/5" />
                  ) : (
                    <div className="font-medium text-primary">{netApy}%</div>
                  )}
                </div>
              </div>
              <div className="flex w-full justify-end">
                <Link className="mt-4" href="/">
                  <Button
                    disabled={isLoading}
                    onMouseDown={() => {
                      handleBaseTokenClick(
                        ACTION_TYPE.BORROW,
                        marketConfigurationUSDC?.baseToken.bits ?? '',
                        'USDC'
                      );
                    }}
                    size={'sm'}
                  >
                    Open Market
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {marketType === 'Earn' && (
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-1 text-white">
                  Net APY
                  <InfoIcon
                    text="Net APY represents the total of Earn APY and Reward APY, calculated as follows: Net APY = Earn APY + Reward APY.
"
                  />
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 bg-white/5" />
                ) : (
                  <div className="font-medium text-primary">{netApy}%</div>
                )}
              </div>
              <div className="flex w-full justify-end">
                <Link className="mt-4" href="/">
                  <Button
                    disabled={isLoading}
                    onMouseDown={() => {
                      handleBaseTokenClick(
                        ACTION_TYPE.SUPPLY,
                        marketConfigurationUSDC?.baseToken.bits ?? '',
                        'USDC'
                      );
                    }}
                    size={'sm'}
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
