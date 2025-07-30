import BigNumber from 'bignumber.js';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CollateralIcons } from '@/components/v2/collateral-icons';
import { appConfig } from '@/configs';
import {
  useApr,
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
import {
  formatUnits,
  getFormattedPrice,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
} from '@/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';

const SkeletonRow = (
  <TableRow>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
  </TableRow>
);

export const Borrow = () => {
  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePrice('USDC');
  const { data: aprDataUSDC, isPending: isAprPendingUSDC } = useApr('USDC');

  const {
    data: marketConfigurationUSDC,
    isPending: isPendingMarketConfigurationUSDC,
  } = useMarketConfiguration('USDC');

  const { data: collateralUtilizationUSDC, isPending: isPendingColUtilUSDC } =
    useUserCollateralUtilization('USDC');

  const {
    data: userCollateralAssetsUSDC,
    isPending: isPendingUserCollateralAssetsUSDC,
  } = useUserCollateralAssets('USDC');

  const { data: userLiquidationPoint, isPending: isPendingLP } =
    useUserLiquidationPoint();

  // const {
  //   data: userCollateralAssetsUSDT,
  //   isPending: isPendingUserCollateralAssetsUSDT,
  // } = useUserCollateralAssets('USDT');
  // const { data: collateralUtilizationUSDT, isPending: isPendingColUtilUSDT } =
  // useUserCollateralUtilization('USDT');
  // const {
  //   data: userSupplyBorrowUSDT,
  //   isPending: isPendingUserSupplyBorrowUSDT,
  // } = useUserSupplyBorrow('USDT');
  // const { data: priceDataUSDT, isPending: isPendingPriceDataUSDT } =
  //   usePrice('USDT');
  // const { data: aprDataUSDT, isPending: isAprPendingUSDT } = useApr('USDT');
  // const {
  //   data: marketConfigurationUSDT,
  //   isPending: isPendingMarketConfigurationUSDT,
  // } = useMarketConfiguration('USDT');

  const currentCollateralUtilizationUSDC = useMemo(() => {
    return Number(collateralUtilizationUSDC?.times(100).toFixed(2));
  }, [collateralUtilizationUSDC]);

  // const currentCollateralUtilizationUSDT = useMemo(() => {
  //   return Number(collateralUtilizationUSDT?.times(100).toFixed(2));
  // }, [collateralUtilizationUSDT]);

  const isLoading = useMemo(() => {
    return [
      isPendingMarketConfigurationUSDC,
      isPendingUserSupplyBorrowUSDC,
      isPendingPriceDataUSDC,
      isAprPendingUSDC,
      isPendingColUtilUSDC,
      isPendingUserCollateralAssetsUSDC,
      isPendingLP,
      // isPendingUserCollateralAssetsUSDT,
      // isPendingPriceDataUSDT,
      // isPendingUserSupplyBorrowUSDT,
      // isAprPendingUSDT,
      // isPendingMarketConfigurationUSDT,
      // isPendingColUtilUSDT,
    ].some((res) => res);
  }, [
    isPendingMarketConfigurationUSDC,
    isPendingUserSupplyBorrowUSDC,
    isPendingPriceDataUSDC,
    isAprPendingUSDC,
    isPendingColUtilUSDC,
    isPendingUserCollateralAssetsUSDC,
    isPendingLP,
    // isPendingUserCollateralAssetsUSDT,
    // isPendingUserSupplyBorrowUSDT,
    // isPendingMarketConfigurationUSDT,
    // isPendingPriceDataUSDT,
    // isAprPendingUSDT,
    // isPendingColUtilUSDT,
  ]);

  const borrowedUSDC = useMemo(() => {
    if (!(userSupplyBorrowUSDC && marketConfigurationUSDC)) {
      return null;
    }
    const res = formatUnits(
      userSupplyBorrowUSDC.borrowed,
      marketConfigurationUSDC.baseTokenDecimals
    );

    if (res.eq(0)) {
      return null;
    }
    return res;
  }, [userSupplyBorrowUSDC, marketConfigurationUSDC]);

  // const borrowedUSDT = useMemo(() => {
  //   if (!userSupplyBorrowUSDT || !marketConfigurationUSDT) {
  //     return null;
  //   }
  //   const res = formatUnits(
  //     userSupplyBorrowUSDT.borrowed,
  //     marketConfigurationUSDT.baseTokenDecimals
  //   );
  //   if (res.eq(0)) {
  //     return null;
  //   }
  //   return res;
  // }, [userSupplyBorrowUSDT, marketConfigurationUSDT]);

  // const borrowedUSDTPrice = useMemo(() => {
  //   if (!priceDataUSDT || !borrowedUSDT || !marketConfigurationUSDT) {
  //     return BigNumber(0);
  //   }
  //   return priceDataUSDT.prices[marketConfigurationUSDT?.baseToken.bits].times(
  //     borrowedUSDT
  //   );
  // }, [priceDataUSDT, borrowedUSDT, marketConfigurationUSDT]);

  const borrowedUSDCPrice = useMemo(() => {
    if (!(priceDataUSDC && borrowedUSDC && marketConfigurationUSDC)) {
      return BigNumber(0);
    }
    return priceDataUSDC.prices[marketConfigurationUSDC?.baseToken.bits].times(
      borrowedUSDC
    );
  }, [priceDataUSDC, borrowedUSDC, marketConfigurationUSDC]);

  // const collateralIconsUSDT = useMemo(() => {
  //   if (!userCollateralAssetsUSDT) return [];

  //   const assetIDs = Object.keys(userCollateralAssetsUSDT);

  //   return assetIDs
  //     .filter((assetId) => {
  //       if (userCollateralAssetsUSDT[assetId].isZero()) return false;
  //       return true;
  //     })
  //     .map((assetId) => {
  //       const symbol = appConfig.client.shared.assets[assetId];
  //       return {
  //         id: symbol,
  //         name: symbol,
  //         description: '',
  //         icon: SYMBOL_TO_ICON[symbol],
  //       };
  //     });
  // }, [userCollateralAssetsUSDT]);

  const collateralIconsUSDC = useMemo(() => {
    if (!userCollateralAssetsUSDC) return [];

    const assetIDs = Object.keys(userCollateralAssetsUSDC);

    return assetIDs
      .filter((assetId) => {
        if (userCollateralAssetsUSDC[assetId].isZero()) return false;
        return true;
      })
      .map((assetId) => {
        const symbol = appConfig.client.shared.assets[assetId];
        return {
          id: symbol,
          name: symbol,
          description: '',
          icon: SYMBOL_TO_ICON[symbol],
        };
      });
  }, [userCollateralAssetsUSDC]);

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

  return (
    <Table className="mt-12 max-lg:hidden">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-white">
              Borrow Positions
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Market
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Collateral
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Borrowed Assets
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Net APY
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Liquidation Risk
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Liquidation Point
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Points
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          SkeletonRow
        ) : borrowedUSDC || borrowedUSDC ? (
          <>
            {borrowedUSDC && (
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <div>
                      <Image
                        alt={'USDC'}
                        className={'rounded-full'}
                        height={32}
                        src={SYMBOL_TO_ICON.USDC}
                        width={32}
                      />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-x-2">
                        <div className="font-semibold text-md text-white">
                          {SYMBOL_TO_NAME.USDC}
                        </div>
                        <div className="font-semibold text-moon text-sm">
                          {'USDC'}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CollateralIcons collaterals={collateralIconsUSDC} />
                </TableCell>

                <TableCell>
                  <span className="font-medium text-lavender">
                    {getFormattedPrice(borrowedUSDCPrice)}
                  </span>{' '}
                  {borrowedUSDC.toFixed(2)} USDC
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2 font-medium text-md text-purple underline">
                    <div>
                      {aprDataUSDC?.borrowBaseApr.times(100).toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'bg-card font-semibold',
                    currentCollateralUtilizationUSDC > 80 && 'text-red-500',
                    currentCollateralUtilizationUSDC > 60 &&
                      currentCollateralUtilizationUSDC <= 80 &&
                      'text-yellow-500',
                    currentCollateralUtilizationUSDC <= 60 && 'text-primary'
                  )}
                >
                  {currentCollateralUtilizationUSDC}%
                </TableCell>
                <TableCell className="font-medium text-white">
                  {getFormattedPrice(userLiquidationPoint ?? BigNumber(0))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-1 text-primary">
                    <Image
                      alt={'USDC'}
                      className={'rounded-full'}
                      height={24}
                      src={SYMBOL_TO_ICON.SWAY}
                      width={24}
                    />
                  </div>
                </TableCell>
                <TableCell className="flex gap-x-2">
                  <Link href="/">
                    <Button
                      onMouseDown={() => {
                        handleBaseTokenClick(
                          ACTION_TYPE.BORROW,
                          marketConfigurationUSDC?.baseToken.bits ?? '',
                          'USDC'
                        );
                      }}
                    >
                      +
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      onMouseDown={() => {
                        handleBaseTokenClick(
                          ACTION_TYPE.REPAY,
                          marketConfigurationUSDC?.baseToken.bits ?? '',
                          'USDC'
                        );
                      }}
                      variant={'secondary'}
                    >
                      -
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {/* {borrowedUSDT && (
                  <TableRow>
                    <TableCell>
                      <div className="flex gap-x-2 items-center">
                        <div>
                          <Image
                            src={SYMBOL_TO_ICON.USDT}
                            alt={'USDT'}
                            width={32}
                            height={32}
                            className={'rounded-full'}
                          />
                        </div>
                        <div>
                          <div className="flex gap-x-2 items-baseline">
                            <div className="text-white text-md font-semibold">
                              {SYMBOL_TO_NAME.USDT}
                            </div>
                            <div className="text-sm font-semibold text-moon">
                              {'USDT'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CollateralIcons collaterals={collateralIconsUSDT} />
                    </TableCell>

                    <TableCell>
                      <span className="text-lavender font-medium">
                        {getFormattedPrice(borrowedUSDTPrice)}
                      </span>{' '}
                      {borrowedUSDT.toFixed(2)} USDT
                    </TableCell>
                    <TableCell
                      className={`font-semibold bg-card ${currentCollateralUtilizationUSDT > 80 && 'text-red-500'} ${currentCollateralUtilizationUSDT > 60 && currentCollateralUtilizationUSDT <= 80 && 'text-yellow-500'} ${currentCollateralUtilizationUSDT <= 60 && 'text-primary'}`}
                    >
                      {currentCollateralUtilizationUSDT}%
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-x-2 items-center text-md font-medium text-white">
                        <div>
                          {aprDataUSDT?.borrowBaseApr.times(100).toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-x-1 items-center text-primary">
                        <Image
                          src={SYMBOL_TO_ICON.FUEL}
                          alt={'FUEL'}
                          width={16}
                          height={16}
                          className={'rounded-full'}
                        />
                        <div>
                          {' '}
                          {aprDataUSDT?.borrowRewardApr.times(100).toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href="/">
                        <Button
                          onMouseDown={() => {
                            handleBaseTokenClick(
                              ACTION_TYPE.BORROW,
                              marketConfigurationUSDT?.baseToken.bits ?? '',
                              'USDT'
                            );
                          }}
                        >
                          <MoveUpRightIcon size={20} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )} */}
          </>
        ) : (
          <TableRow>
            <TableCell colSpan={8}>
              <div className="flex w-full items-center justify-center font-semibold text-md text-moon">
                No Borrow Positions Open.
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
