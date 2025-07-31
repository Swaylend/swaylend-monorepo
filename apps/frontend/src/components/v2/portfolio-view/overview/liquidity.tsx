import BigNumber from 'bignumber.js';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useApr,
  useMarketConfiguration,
  usePriceData,
  useUserSupplyBorrow,
} from '@/hooks/v2';
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
  </TableRow>
);

export const Liquidity = () => {
  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePriceData('USDC');
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
    if (!(userSupplyBorrowUSDC && marketConfigurationUSDC)) {
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
    if (!(priceDataUSDC && suppliedUSDC && marketConfigurationUSDC)) {
      return BigNumber(0);
    }

    const baseTokenPrice = priceDataUSDC.prices.get(
      marketConfigurationUSDC?.baseToken.bits ?? ''
    )?.[0];

    return baseTokenPrice?.price.times(suppliedUSDC) ?? BigNumber(0);
  }, [priceDataUSDC?.timestamp, suppliedUSDC, marketConfigurationUSDC]);

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
            <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-white">
              Earn Positions
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Market
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Assets
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Net APY
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
        ) : !suppliedUSDC ||
          suppliedUSDC.toNumber() < 0.01 /*&& !suppliedUSDT */ ? (
          <TableRow>
            <TableCell colSpan={8}>
              <div className="flex w-full items-center justify-center font-semibold text-md text-moon">
                No Earn Positions Open.
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <>
            {suppliedUSDC && (
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
                  <span className="font-medium text-lavender">
                    {getFormattedPrice(suppliedUSDCPrice)}
                  </span>{' '}
                  {suppliedUSDC.toFixed(2)} USDC
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2 font-medium text-md text-primary underline">
                    <div>
                      {aprDataUSDC?.supplyBaseApr.times(100).toFixed(2)}%
                    </div>
                  </div>
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
                <TableCell>
                  <div className="flex gap-x-2">
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
                        +
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button
                        onMouseDown={() => {
                          handleBaseTokenClick(
                            ACTION_TYPE.WITHDRAW,
                            marketConfigurationUSDC?.baseToken.bits ?? '',
                            'USDC'
                          );
                        }}
                        variant={'secondary'}
                      >
                        -
                      </Button>
                    </Link>
                  </div>
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
                          width={24}
                          height={24}
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
      </TableBody>
    </Table>
  );
};
