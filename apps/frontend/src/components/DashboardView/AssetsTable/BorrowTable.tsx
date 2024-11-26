import { InfoIcon } from '@/components/InfoIcon';
import { PointIcons } from '@/components/PointIcons';
import { POINTS_BORROW } from '@/components/PointIcons/PointsTooltip';
import { Title } from '@/components/Title';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appConfig } from '@/configs';
import {
  USER_ROLE,
  useBalance,
  useBorrowCapacity,
  useBorrowRate,
  useMarketConfiguration,
  usePrice,
  useUserRole,
  useUserSupplyBorrow,
} from '@/hooks';
import { cn } from '@/lib/utils';
import {
  ACTION_TYPE,
  selectChangeAction,
  selectChangeActionTokenAssetId,
  selectChangeInputDialogOpen,
  selectChangeTokenAmount,
  useMarketStore,
} from '@/stores';
import {
  SYMBOL_TO_ICON,
  formatUnits,
  getBorrowApr,
  getFormattedNumber,
} from '@/utils';
import { useAccount, useIsConnected } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { useMemo } from 'react';

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
      <div className="flex gap-x-2 w-full">
        <Button className="w-1/2" disabled={true}>
          Borrow
        </Button>
        <Button className="w-1/2" disabled={true}>
          Repay
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

const SkeletonCardContent = (
  <CardContent>
    <div className="flex flex-col gap-y-4 pt-8 px-4">
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Borrow Asset</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Borrow APY</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Your Supplied Assets</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Supply Points</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
    </div>
  </CardContent>
);

export const BorrowTable = () => {
  const { account } = useAccount();
  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeActionTokenAssetId = useMarketStore(
    selectChangeActionTokenAssetId
  );
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);

  const { data: borrowRate, isPending: isBorrowRatePending } = useBorrowRate();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration();
  const { data: maxBorrowAmount } = useBorrowCapacity();
  const userRole = useUserRole();
  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeActionTokenAssetId(marketConfiguration?.baseToken.bits);
    changeInputDialogOpen(true);
  };

  const { isConnected } = useIsConnected();

  const { data: balance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken.bits,
  });

  const borrowedBalance = useMemo(() => {
    if (!marketConfiguration || !userSupplyBorrow || !isConnected) {
      return `${getFormattedNumber(BigNumber(0))} ${appConfig.assets[marketConfiguration?.baseToken.bits ?? '']}`;
    }

    let val = formatUnits(
      userSupplyBorrow.borrowed,
      marketConfiguration.baseTokenDecimals
    );
    if (val.gt(0)) {
      val = val.plus(
        BigNumber(0.001).div(
          priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
        )
      );
    }

    if (val.lt(1) && val.gt(0)) {
      return `< 1 ${appConfig.assets[marketConfiguration?.baseToken.bits ?? '']}`;
    }
    return `${getFormattedNumber(val)} ${appConfig.assets[marketConfiguration?.baseToken.bits ?? '']}`;
  }, [marketConfiguration, userSupplyBorrow, isConnected]);

  return (
    <>
      {/* DESKTOP */}
      <Table className="max-lg:hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/12">
              <div className="flex items-center gap-x-2">
                Borrow Asset
                <InfoIcon
                  text={
                    "Base asset available for borrowing once you've provided at least one collateral asset."
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-1/6">Borrow APY</TableHead>
            <TableHead className="w-1/6">Your Borrow Position</TableHead>
            <TableHead className="w-1/6">
              <div className="flex items-center gap-x-2">
                Borrow Points
                <InfoIcon
                  text={
                    'Points earned for maintaining an active borrowing position. Hover over the points to learn more.'
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-3/12">{}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPendingMarketConfiguration ? (
            SkeletonRow
          ) : (
            <TableRow>
              <TableCell>
                <div className="flex gap-x-2 items-center">
                  <div>
                    {marketConfiguration && (
                      <Image
                        src={
                          SYMBOL_TO_ICON[
                            appConfig.assets[marketConfiguration.baseToken.bits]
                          ]
                        }
                        alt={
                          appConfig.assets[marketConfiguration.baseToken.bits]
                        }
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {
                        appConfig.assets[
                          marketConfiguration?.baseToken.bits ?? ''
                        ]
                      }
                    </div>
                    <div>
                      {getFormattedNumber(
                        formatUnits(
                          balance
                            ? BigNumber(balance.toString())
                            : BigNumber(0),
                          marketConfiguration?.baseTokenDecimals ?? 9
                        )
                      )}{' '}
                      {
                        appConfig.assets[
                          marketConfiguration?.baseToken.bits ?? ''
                        ]
                      }
                      {' in wallet'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  isBorrowRatePending && 'animate-pulse',
                  'text-white text-md font-medium'
                )}
              >
                {getBorrowApr(borrowRate)}
              </TableCell>
              <TableCell>{borrowedBalance}</TableCell>
              <TableCell>
                <PointIcons points={POINTS_BORROW} />
              </TableCell>
              <TableCell>
                {userRole === USER_ROLE.LENDER ? (
                  <div className=" text-lavender bg-primary/20 rounded-lg px-4 py-2 text-sm font-medium text-center w-full">
                    You cannot Borrow assets while you have an active Earn
                    position. Learn more about how{' '}
                    <a
                      href="https://docs.swaylend.com/navigate-swaylend"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:opacity-90 text-white"
                    >
                      Swaylend works.
                    </a>
                  </div>
                ) : (
                  <div className="flex gap-x-2 w-full">
                    <Button
                      disabled={
                        !account || !maxBorrowAmount || maxBorrowAmount.eq(0)
                      }
                      className="w-1/2"
                      onMouseDown={() => {
                        handleBaseTokenClick(ACTION_TYPE.BORROW);
                      }}
                    >
                      Borrow
                    </Button>
                    <Button
                      disabled={
                        !account ||
                        !userSupplyBorrow ||
                        userSupplyBorrow.borrowed.eq(0)
                      }
                      className="w-1/2"
                      variant="secondary"
                      onMouseDown={() => {
                        handleBaseTokenClick(ACTION_TYPE.REPAY);
                      }}
                    >
                      Repay
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* MOBILE */}
      <div className="flex flex-col gap-y-4 px-4 lg:hidden">
        <Title>Borrow Assets</Title>
        <Card>
          <VisuallyHidden.Root asChild>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
          </VisuallyHidden.Root>
          {isPendingMarketConfiguration ? (
            SkeletonCardContent
          ) : (
            <CardContent>
              <div className="flex flex-col gap-y-4 pt-8 px-4">
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
                    Borrow Asset
                  </div>
                  <div className="flex gap-x-2 items-center">
                    <div>
                      {marketConfiguration && (
                        <Image
                          src={
                            SYMBOL_TO_ICON[
                              appConfig.assets[
                                marketConfiguration.baseToken.bits
                              ]
                            ]
                          }
                          alt={
                            appConfig.assets[marketConfiguration.baseToken.bits]
                          }
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {
                          appConfig.assets[
                            marketConfiguration?.baseToken.bits ?? ''
                          ]
                        }
                      </div>
                      <div className="text-moon text-sm">
                        {getFormattedNumber(
                          formatUnits(
                            balance
                              ? BigNumber(balance.toString())
                              : BigNumber(0),
                            marketConfiguration?.baseTokenDecimals ?? 9
                          )
                        )}
                        {' in wallet'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon text-md font-medium">
                    Borrow APY
                  </div>
                  <div
                    className={cn(
                      'text-white text-md font-medium',
                      isBorrowRatePending && 'animate-pulse'
                    )}
                  >
                    {getBorrowApr(borrowRate)}
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
                    Your Borrow Position
                  </div>
                  <div className="text-moon">{borrowedBalance}</div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
                    Borrow Points
                  </div>
                  <PointIcons points={POINTS_BORROW} />
                </div>
              </div>
            </CardContent>
          )}
          <CardFooter>
            {userRole === USER_ROLE.LENDER ? (
              <div className=" text-lavender bg-primary/20 rounded-lg px-4 py-2 text-sm font-medium text-center w-full">
                You cannot Borrow assets while you have an active Earn position.
                Learn more about how{' '}
                <a
                  href="https://docs.swaylend.com/navigate-swaylend"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-90 text-white"
                >
                  Swaylend works.
                </a>
              </div>
            ) : (
              <div className="flex gap-x-2 w-full">
                <Button
                  disabled={
                    !account || !maxBorrowAmount || maxBorrowAmount.eq(0)
                  }
                  className="w-1/2"
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.BORROW);
                  }}
                >
                  Borrow
                </Button>
                <Button
                  disabled={
                    !account ||
                    !userSupplyBorrow ||
                    userSupplyBorrow.borrowed.eq(0)
                  }
                  className="w-1/2"
                  variant={'secondary'}
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.REPAY);
                  }}
                >
                  Repay
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
