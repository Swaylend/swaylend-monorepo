import { useAccount } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
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
import { InfoIcon } from '@/components/v2/info-icon';
import { NetEarnTooltip } from '@/components/v2/net-earn-tooltip';
import { PointIcons } from '@/components/v2/point-icons';
import {
  POINTS_LEND,
  POINTS_LM,
} from '@/components/v2/point-icons/points-tooltip';
import { Title } from '@/components/v2/title';
import { appConfig } from '@/configs';
import {
  USER_ROLE,
  useApr,
  useBalance,
  useMarketConfiguration,
  useUserRole,
  useUserSupplyBorrow,
} from '@/hooks/v2';
import { cn } from '@/lib/utils';
import { ACTION_TYPE, useMarketStore } from '@/stores/market-store';
import { formatUnits, getFormattedNumber, SYMBOL_TO_ICON } from '@/utils';

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
      <div className="flex w-full gap-x-2">
        <Button className="w-1/2" disabled={true}>
          Supply
        </Button>
        <Button className="w-1/2" disabled={true}>
          Withdraw
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

const SkeletonCardContent = (
  <CardContent>
    <div className="flex flex-col gap-y-4 px-4 pt-8">
      <div className="flex w-full items-center">
        <div className="w-1/2 font-medium text-moon">Asset</div>
        <Skeleton className="h-[24px] w-1/2 rounded-md bg-primary/20" />
      </div>
      <div className="flex w-full items-center">
        <div className="w-1/2 font-medium text-moon">Earn APY</div>
        <Skeleton className="h-[24px] w-1/2 rounded-md bg-primary/20" />
      </div>
      <div className="flex w-full items-center">
        <div className="w-1/2 font-medium text-moon">Your Supplied Assets</div>
        <Skeleton className="h-[24px] w-1/2 rounded-md bg-primary/20" />
      </div>
      <div className="flex w-full items-center">
        <div className="w-1/2 font-medium text-moon">Reward APY</div>
        <Skeleton className="h-[24px] w-1/2 rounded-md bg-primary/20" />
      </div>
      <div className="flex w-full items-center">
        <div className="w-1/2 font-medium text-moon">Net APY</div>
        <Skeleton className="h-[24px] w-1/2 rounded-md bg-primary/20" />
      </div>
      <div className="flex w-full items-center">
        <div className="w-1/2 font-medium text-moon">Supply Points</div>
        <Skeleton className="h-[24px] w-1/2 rounded-md bg-primary/20" />
      </div>
    </div>
  </CardContent>
);

export const LendTable = () => {
  const { account } = useAccount();
  const changeAction = useMarketStore.use.changeAction();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeActionTokenAssetId =
    useMarketStore.use.changeActionTokenAssetId();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();

  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration();

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeActionTokenAssetId(marketConfiguration?.baseToken.bits);
    changeInputDialogOpen(true);
  };

  const { data: balance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken.bits,
  });

  const { data: aprData, isPending: isAprPending } = useApr();

  const userRole = useUserRole();

  return (
    <>
      {/* DESKTOP */}
      <Table className="max-lg:hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/12">
              <div className="flex items-center gap-x-2">
                Earn Asset
                <InfoIcon text={'Base asset available for lending.'} />
              </div>
            </TableHead>
            <TableHead className="w-2/12">Earn APY</TableHead>
            <TableHead className="w-2/12">Your Supplied Assets</TableHead>
            <TableHead className="w-1/12">
              <div className="flex items-center gap-x-2">
                Reward APY
                <InfoIcon
                  text={
                    <div>
                      <span className="font-bold">Reward APY</span> represents
                      the annual percentage yield (APY) on partner tokens that
                      users can earn while holding a Earn position.
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
                    <div>
                      <span className="font-bold">Net APY</span> represents the
                      total of Earn APY and Reward APY, calculated as follows:{' '}
                      <span className="font-bold">
                        Net APY = Earn APY + Reward APY
                      </span>
                      .
                    </div>
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-2/12">
              <div className="flex items-center gap-x-2">
                Earn Points
                <InfoIcon
                  text={
                    'Points earned for maintaining an active lending position. Hover over the points to learn more.'
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
                <div className="flex items-center gap-x-2">
                  <div>
                    {marketConfiguration && (
                      <Image
                        alt={
                          appConfig.client.shared.assets[
                            marketConfiguration.baseToken.bits
                          ]
                        }
                        className="rounded-full"
                        height={32}
                        src={
                          SYMBOL_TO_ICON[
                            appConfig.client.shared.assets[
                              marketConfiguration.baseToken.bits
                            ]
                          ]
                        }
                        width={32}
                      />
                    )}
                  </div>
                  <div>
                    {marketConfiguration && (
                      <div className="font-medium text-white">
                        {
                          appConfig.client.shared.assets[
                            marketConfiguration.baseToken.bits
                          ]
                        }
                      </div>
                    )}
                    <div className="text-moon">
                      {getFormattedNumber(
                        formatUnits(
                          balance
                            ? BigNumber(balance.toString())
                            : BigNumber(0),
                          marketConfiguration?.baseTokenDecimals ?? 9
                        )
                      )}{' '}
                      {
                        appConfig.client.shared.assets[
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
                  'font-medium text-md text-white'
                )}
              >
                {aprData?.supplyBaseApr.times(100).toFixed(2)}%
              </TableCell>
              <TableCell className="text-moon">
                {getFormattedNumber(
                  formatUnits(
                    userSupplyBorrow?.supplied ?? BigNumber(0),
                    marketConfiguration?.baseTokenDecimals ?? 9
                  )
                )}{' '}
                {
                  appConfig.client.shared.assets[
                    marketConfiguration?.baseToken.bits ?? ''
                  ]
                }
              </TableCell>
              <TableCell
                className={cn(
                  isAprPending && 'animate-pulse',
                  'font-medium text-md text-white'
                )}
              >
                <div className="flex items-center gap-x-2">
                  {aprData?.supplyRewardApr.times(100).toFixed(2)}%
                  <PointIcons points={POINTS_LM} />
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  isAprPending && 'animate-pulse',
                  'font-medium text-md text-white'
                )}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={(e: { preventDefault: () => any }) =>
                        e.preventDefault()
                      }
                    >
                      <div>{aprData?.netSupplyApr.times(100).toFixed(2)}%</div>
                    </TooltipTrigger>
                    <TooltipContent
                      onPointerDownOutside={(e: {
                        preventDefault: () => any;
                      }) => e.preventDefault()}
                    >
                      <NetEarnTooltip aprData={aprData} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <PointIcons points={POINTS_LEND} />
              </TableCell>
              <TableCell>
                {userRole === USER_ROLE.BORROWER ? (
                  <div className="w-full rounded-lg bg-primary/20 px-4 py-2 text-center font-medium text-lavender text-sm">
                    You cannot Lend assets while you have an active borrowing
                    position. Learn more about how{' '}
                    <a
                      className="text-white underline hover:opacity-90"
                      href="https://swaylend.gitbook.io/swaylend-docs/get-started/navigate-swaylend"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Swaylend works.
                    </a>
                  </div>
                ) : (
                  <div className="flex w-full gap-x-2">
                    <Button
                      className="w-1/2"
                      disabled={!(account && balance?.gt(0))}
                      onMouseDown={() => {
                        handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                      }}
                    >
                      Supply
                    </Button>
                    <Button
                      className="w-1/2"
                      disabled={
                        !(account && userSupplyBorrow) ||
                        userSupplyBorrow.supplied.eq(0)
                      }
                      onMouseDown={() => {
                        handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
                      }}
                      variant="secondary"
                    >
                      Withdraw
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
        <Title>Earn Assets</Title>
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
              <div className="flex flex-col gap-y-4 px-4 pt-8">
                <div className="flex w-full items-center">
                  <div className="w-1/2 font-medium text-moon">Asset</div>
                  <div className="flex items-center gap-x-2">
                    <div>
                      {marketConfiguration && (
                        <Image
                          alt={
                            appConfig.client.shared.assets[
                              marketConfiguration.baseToken.bits
                            ]
                          }
                          className={'rounded-full'}
                          height={32}
                          src={
                            SYMBOL_TO_ICON[
                              appConfig.client.shared.assets[
                                marketConfiguration.baseToken.bits
                              ]
                            ]
                          }
                          width={32}
                        />
                      )}
                    </div>
                    <div>
                      {marketConfiguration && (
                        <div className="font-medium text-white">
                          {
                            appConfig.client.shared.assets[
                              marketConfiguration.baseToken.bits
                            ]
                          }
                        </div>
                      )}
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
                <div className="flex w-full items-center">
                  <div className="w-1/2 font-medium text-moon">Earn APY</div>
                  <div
                    className={cn(
                      'text-white',
                      isAprPending && 'animate-pulse'
                    )}
                  >
                    {aprData?.supplyBaseApr.times(100).toFixed(2)}%
                  </div>
                </div>
                <div className="flex w-full items-center">
                  <div className="w-1/2 font-medium text-moon">
                    Your Supplied Assets
                  </div>
                  <div className="text-moon">
                    {getFormattedNumber(
                      formatUnits(
                        userSupplyBorrow?.supplied ?? BigNumber(0),
                        marketConfiguration?.baseTokenDecimals ?? 9
                      )
                    )}{' '}
                    {
                      appConfig.client.shared.assets[
                        marketConfiguration?.baseToken.bits ?? ''
                      ]
                    }
                  </div>
                </div>
                <div className="flex w-full items-center">
                  <div className="w-1/2 font-medium text-moon">Reward APY</div>
                  <div
                    className={cn(
                      'text-white',
                      isAprPending && 'animate-pulse'
                    )}
                  >
                    <div className="flex items-center gap-x-2">
                      {aprData?.supplyRewardApr.times(100).toFixed(2)}%
                      <PointIcons points={POINTS_LM} />
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center">
                  <div className="w-1/2 font-medium text-moon">Net APY</div>
                  <div
                    className={cn(
                      'text-white',
                      isAprPending && 'animate-pulse'
                    )}
                  >
                    {aprData?.netSupplyApr.times(100).toFixed(2)}%
                  </div>
                </div>
                <div className="flex w-full items-center">
                  <div className="w-1/2 font-medium text-moon">
                    Supply Points
                  </div>
                  <PointIcons mobile points={POINTS_LEND} />
                </div>
              </div>
            </CardContent>
          )}
          <CardFooter>
            {userRole === USER_ROLE.BORROWER ? (
              <div className="w-full rounded-lg bg-primary/20 px-4 py-2 text-center font-medium text-lavender text-sm">
                You cannot Lend assets while you have an active borrowing
                position. Learn more about how{' '}
                <a
                  className="text-white underline hover:opacity-90"
                  href="https://swaylend.gitbook.io/swaylend-docs/get-started/navigate-swaylend"
                  rel="noreferrer"
                  target="_blank"
                >
                  Swaylend works.
                </a>
              </div>
            ) : (
              <div className="flex w-full gap-x-2">
                <Button
                  className="w-1/2"
                  disabled={!(account && balance?.gt(0))}
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                  }}
                >
                  Supply
                </Button>
                <Button
                  className="w-1/2"
                  disabled={
                    !(account && userSupplyBorrow) ||
                    userSupplyBorrow.supplied.eq(0)
                  }
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
                  }}
                  variant={'secondary'}
                >
                  Withdraw
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
