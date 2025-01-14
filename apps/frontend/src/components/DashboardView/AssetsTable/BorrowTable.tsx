import { InfoIcon } from '@/components/InfoIcon';
import { Line } from '@/components/Line';
import { PointIcons } from '@/components/PointIcons';
import {
  POINTS_BORROW,
  POINTS_LM,
} from '@/components/PointIcons/PointsTooltip';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { appConfig } from '@/configs';
import {
  USER_ROLE,
  useApr,
  useBalance,
  useBorrowCapacity,
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
import { SYMBOL_TO_ICON, formatUnits, getFormattedNumber } from '@/utils';
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
        <div className="w-1/2 text-moon font-medium">Borrow APY</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Borrow APY</div>
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

  const { data: aprData, isPending: isAprPending } = useApr();

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
            <TableHead className="w-2/12">
              <div className="flex items-center gap-x-2">
                Borrow Asset
                <InfoIcon
                  text={
                    "Base asset available for borrowing once you've provided at least one collateral asset."
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-2/12">Borrow APY</TableHead>
            <TableHead className="w-2/12">Your Borrow Position</TableHead>
            <TableHead className="w-1/12">
              <div className="flex items-center gap-x-2">
                Reward APY
                <InfoIcon
                  text={
                    <div className="flex flex-col gap-y-1">
                      <div>
                        <span className="font-bold">Reward APY</span> represents
                        the annual percentage yield (APY) on partner tokens that
                        users can earn while holding a Borrow position.
                      </div>
                      <div className="text-moon italic">
                        Please note: Rewards are applicable only when the
                        collateral asset for the Borrow position is ETH, USDT,
                        or FUEL.
                      </div>
                    </div>
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-1/12">
              <div className="flex items-center gap-x-2">
                Net APY
                <InfoIcon
                  text={
                    <div className="flex flex-col gap-y-1">
                      <div>
                        <span className="font-bold">Net APY</span> represents
                        the total of Borrow APY and Reward APY, calculated as
                        follows:{' '}
                        <span className="font-bold">
                          Net APY = Borrow APY - Reward APY
                        </span>
                        .
                      </div>
                      <div className="text-moon italic">
                        Please note: Rewards are applicable only when the
                        collateral asset for the Borrow position is ETH, USDT,
                        or FUEL.
                      </div>
                    </div>
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-2/12">
              <div className="flex items-center gap-x-2">
                Borrow Points
                <InfoIcon
                  text={
                    'Points earned for maintaining an active borrowing position. Hover over the points to learn more.'
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-2/12">{}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPendingMarketConfiguration || isAprPending ? (
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
                  isAprPending && 'animate-pulse',
                  'text-white text-md font-medium'
                )}
              >
                {aprData?.borrowBaseApr.times(100).toFixed(2)}%
              </TableCell>
              <TableCell>{borrowedBalance}</TableCell>
              <TableCell
                className={cn(
                  isAprPending && 'animate-pulse',
                  'text-white text-md font-medium'
                )}
              >
                <div className="flex gap-x-2 items-center">
                  {aprData?.borrowRewardApr.times(100).toFixed(2)}%
                  <PointIcons points={POINTS_LM} />
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  isAprPending && 'animate-pulse',
                  'text-white text-md font-medium'
                )}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={(e: { preventDefault: () => any }) =>
                        e.preventDefault()
                      }
                    >
                      <div>{aprData?.netBorrowApr.times(100).toFixed(2)}%</div>
                    </TooltipTrigger>
                    <TooltipContent
                      onPointerDownOutside={(e: {
                        preventDefault: () => any;
                      }) => e.preventDefault()}
                    >
                      <div className="w-[200px] p-2">
                        <div className="flex justify-center font-semibold text-white text-lg">
                          Net Borrow APY
                        </div>
                        <div className="mt-4 flex flex-col font-normal">
                          <div className="flex justify-between text-md">
                            <div>Borrow APY</div>
                            <div>
                              {aprData?.borrowBaseApr.times(100).toFixed(2)}%
                            </div>
                          </div>
                          <div className="flex justify-between text-md pb-2">
                            <div className="flex flex-col gap-y-1">
                              <div>Reward APY</div>
                              <div className="text-xs italic text-moon">
                                Distributed in $FUEL
                              </div>
                            </div>
                            <div>
                              - {aprData?.borrowRewardApr.times(100).toFixed(2)}
                              %
                            </div>
                          </div>
                        </div>
                        <Line />
                        <div className="flex justify-between text-md font-normal pt-1">
                          <div>Net Borrow APY</div>
                          <div>
                            {aprData?.netBorrowApr.times(100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <PointIcons points={POINTS_BORROW} />
              </TableCell>
              <TableCell>
                {userRole === USER_ROLE.LENDER ? (
                  <div className="text-lavender bg-primary/20 rounded-lg px-4 py-2 text-sm font-medium text-center w-full">
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
          {isPendingMarketConfiguration || isAprPending ? (
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
                      isAprPending && 'animate-pulse'
                    )}
                  >
                    {aprData?.borrowBaseApr.times(100).toFixed(2)}%
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
                    Your Borrow Position
                  </div>
                  <div className="text-moon">{borrowedBalance}</div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon text-md font-medium">
                    Reward APY
                  </div>
                  <div
                    className={cn(
                      'text-white text-md font-medium',
                      isAprPending && 'animate-pulse'
                    )}
                  >
                    <div className="flex gap-x-2 items-center">
                      {aprData?.borrowRewardApr.times(100).toFixed(2)}%
                      <PointIcons points={POINTS_LM} />
                    </div>
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon text-md font-medium">
                    Net APY
                  </div>
                  <div
                    className={cn(
                      'text-white text-md font-medium',
                      isAprPending && 'animate-pulse'
                    )}
                  >
                    {aprData?.netBorrowApr.times(100).toFixed(2)}%
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
                    Borrow Points
                  </div>
                  <PointIcons points={POINTS_BORROW} mobile />
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
