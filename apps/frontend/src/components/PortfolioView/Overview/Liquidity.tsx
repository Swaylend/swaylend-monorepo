import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useApr,
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserSupplyBorrow,
} from '@/hooks';
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
import {
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
  getFormattedPrice,
} from '@/utils';
import BigNumber from 'bignumber.js';
import { MoveUpRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';

const SkeletonRow = (
  <TableRow>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
  </TableRow>
);

export const Liquidity = () => {
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

  const isLoading = useMemo(() => {
    return [
      isPendingMarketConfigurationUSDC,
      isPendingUserSupplyBorrowUSDC,
      isPendingPriceDataUSDC,
      isAprPendingUSDC,
      // isPendingMarketConfigurationUSDT,
      // isPendingUserSupplyBorrowUSDT,
      // isPendingPriceDataUSDT,
      // isAprPendingUSDT,
    ].some((res) => res);
  }, [
    isPendingMarketConfigurationUSDC,
    isPendingUserSupplyBorrowUSDC,
    isPendingPriceDataUSDC,
    // isPendingMarketConfigurationUSDT,
    isAprPendingUSDC,
    // isPendingUserSupplyBorrowUSDT,
    // isPendingPriceDataUSDT,
    // isAprPendingUSDT,
  ]);

  const suppliedUSDC = useMemo(() => {
    if (!userSupplyBorrowUSDC || !marketConfigurationUSDC) {
      return null;
    }
    const res = formatUnits(
      userSupplyBorrowUSDC.supplied,
      marketConfigurationUSDC.baseTokenDecimals
    );

    if (res.eq(0)) {
      return null;
    }
    return res;
  }, [userSupplyBorrowUSDC, marketConfigurationUSDC]);

  // const suppliedUSDT = useMemo(() => {
  //   if (!userSupplyBorrowUSDT || !marketConfigurationUSDT) {
  //     return null;
  //   }
  //   const res = formatUnits(
  //     userSupplyBorrowUSDT.supplied,
  //     marketConfigurationUSDT.baseTokenDecimals
  //   );
  //   if (res.eq(0)) {
  //     return null;
  //   }
  //   return res;
  // }, [userSupplyBorrowUSDT, marketConfigurationUSDT]);

  // const suppliedUSDTPrice = useMemo(() => {
  //   if (!priceDataUSDT || !suppliedUSDT || !marketConfigurationUSDT) {
  //     return BigNumber(0);
  //   }
  //   return priceDataUSDT.prices[marketConfigurationUSDT?.baseToken.bits].times(
  //     suppliedUSDT
  //   );
  // }, [priceDataUSDT, suppliedUSDT, marketConfigurationUSDT]);

  const suppliedUSDCPrice = useMemo(() => {
    if (!priceDataUSDC || !suppliedUSDC || !marketConfigurationUSDC) {
      return BigNumber(0);
    }
    return priceDataUSDC.prices[marketConfigurationUSDC?.baseToken.bits].times(
      suppliedUSDC
    );
  }, [priceDataUSDC, suppliedUSDC, marketConfigurationUSDC]);

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
    changeMarketMode(MARKET_MODE.LEND);
    changeActionTokenAssetId(assetId);
    changeInputDialogOpen(true);
    changeMarket(market);
  };

  return (
    <Table className="max-lg:hidden">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="w-full flex items-center justify-center gap-x-2 text-white font-semibold">
              Liquidity
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Market
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Assets
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            APY
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Rewards APY
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <>{SkeletonRow}</>
        ) : (
          <>
            {!suppliedUSDC ||
            suppliedUSDC.toNumber() < 0.01 /*&& !suppliedUSDT */ ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                    No Lend Positions Open.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {suppliedUSDC && (
                  <TableRow>
                    <TableCell>
                      <div className="flex gap-x-2 items-center">
                        <div>
                          <Image
                            src={SYMBOL_TO_ICON.USDC}
                            alt={'USDC'}
                            width={32}
                            height={32}
                            className={'rounded-full'}
                          />
                        </div>
                        <div>
                          <div className="flex gap-x-2 items-baseline">
                            <div className="text-white text-md font-semibold">
                              {SYMBOL_TO_NAME.USDC}
                            </div>
                            <div className="text-sm font-semibold text-moon">
                              {'USDC'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-lavender font-medium">
                        {getFormattedPrice(suppliedUSDCPrice)}
                      </span>{' '}
                      {suppliedUSDC.toFixed(2)} USDC
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-x-2 items-center text-md font-medium text-white">
                        <div>
                          {aprDataUSDC?.supplyBaseApr.times(100).toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-x-1 items-center text-primary">
                        <Image
                          src={SYMBOL_TO_ICON.FUEL}
                          alt={'USDC'}
                          width={16}
                          height={16}
                          className={'rounded-full'}
                        />
                        <div>
                          {' '}
                          {aprDataUSDC?.supplyRewardApr.times(100).toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href="/">
                        <Button
                          onMouseDown={() => {
                            handleBaseTokenClick(
                              ACTION_TYPE.SUPPLY,
                              marketConfigurationUSDC?.baseToken.bits ?? '',
                              'USDC'
                            );
                          }}
                        >
                          <MoveUpRightIcon size={20} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
                {/* {suppliedUSDT && (
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
                    <TableCell className="">
                      <span className="text-lavender font-medium">
                        {getFormattedPrice(suppliedUSDTPrice)}
                      </span>{' '}
                      {suppliedUSDT.toFixed(2)} USDT
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-x-2 items-center text-md font-medium text-white">
                        <div>
                          {aprDataUSDT?.supplyBaseApr.times(100).toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-x-1 items-center text-primary">
                        <Image
                          src={SYMBOL_TO_ICON.FUEL}
                          alt={'USDT'}
                          width={16}
                          height={16}
                          className={'rounded-full'}
                        />
                        <div>
                          {' '}
                          {aprDataUSDT?.supplyRewardApr.times(100).toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href="/">
                        <Button
                          onMouseDown={() => {
                            handleBaseTokenClick(
                              ACTION_TYPE.SUPPLY,
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
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};
