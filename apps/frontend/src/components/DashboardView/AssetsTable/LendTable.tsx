import { InfoIcon } from '@/components/InfoIcon';
import { PointIcons } from '@/components/PointIcons';
import { POINTS_LEND } from '@/components/PointIcons/PointsTooltip';
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
  useMarketConfiguration,
  useSupplyRate,
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
  getFormattedNumber,
  getSupplyApr,
} from '@/utils';
import { useAccount } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import Image from 'next/image';

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
    <div className="flex flex-col gap-y-4 pt-8 px-4">
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Asset</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Supply APY</div>
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

export const LendTable = () => {
  const { account } = useAccount();
  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeActionTokenAssetId = useMarketStore(
    selectChangeActionTokenAssetId
  );
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);

  const { data: supplyRate, isPending: isSupplyRatePending } = useSupplyRate();
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

  const userRole = useUserRole();

  return (
    <>
      {/* DESKTOP */}
      <Table className="max-lg:hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/12">
              <div className="flex items-center gap-x-2">
                Earn Asset
                <InfoIcon text={'Base asset available for lending.'} />
              </div>
            </TableHead>
            <TableHead className="w-1/6">Supply APY</TableHead>
            <TableHead className="w-1/6">Your Supplied Assets</TableHead>
            <TableHead className="w-1/6">
              <div className="flex items-center gap-x-2">
                Earn Points
                <InfoIcon
                  text={
                    'Points earned for maintaining an active lending position. Hover over the points to learn more.'
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
                    {marketConfiguration && (
                      <div className="text-white font-medium">
                        {appConfig.assets[marketConfiguration.baseToken.bits]}
                      </div>
                    )}
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
                  isSupplyRatePending && 'animate-pulse',
                  'text-white text-md font-medium'
                )}
              >
                {getSupplyApr(supplyRate)}
              </TableCell>
              <TableCell>
                {getFormattedNumber(
                  formatUnits(
                    userSupplyBorrow?.supplied ?? BigNumber(0),
                    marketConfiguration?.baseTokenDecimals ?? 9
                  )
                )}{' '}
                {appConfig.assets[marketConfiguration?.baseToken.bits ?? '']}
              </TableCell>
              <TableCell>
                <PointIcons points={POINTS_LEND} />
              </TableCell>
              <TableCell>
                {userRole === USER_ROLE.BORROWER ? (
                  <div className=" text-lavender bg-primary/20 rounded-lg px-4 py-2 text-sm font-medium text-center w-full">
                    You cannot Lend assets while you have an active borrowing
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
                      className="w-1/2"
                      disabled={!account || !balance?.gt(0)}
                      onMouseDown={() => {
                        handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                      }}
                    >
                      Supply
                    </Button>
                    <Button
                      className="w-1/2"
                      disabled={
                        !account ||
                        !userSupplyBorrow ||
                        userSupplyBorrow.supplied.eq(0)
                      }
                      variant="secondary"
                      onMouseDown={() => {
                        handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
                      }}
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
          {isPendingMarketConfiguration ? (
            SkeletonCardContent
          ) : (
            <CardContent>
              <div className="flex flex-col gap-y-4 pt-8 px-4">
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">Asset</div>
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
                          className={'rounded-full'}
                        />
                      )}
                    </div>
                    <div>
                      {marketConfiguration && (
                        <div className="text-white font-medium">
                          {appConfig.assets[marketConfiguration.baseToken.bits]}
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
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">Supply APY</div>
                  <div
                    className={cn(
                      'text-white',
                      isSupplyRatePending && 'animate-pulse'
                    )}
                  >
                    {getSupplyApr(supplyRate)}
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
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
                      appConfig.assets[
                        marketConfiguration?.baseToken.bits ?? ''
                      ]
                    }
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">
                    Supply Points
                  </div>
                  <PointIcons points={POINTS_LEND} />
                </div>
              </div>
            </CardContent>
          )}
          <CardFooter>
            {userRole === USER_ROLE.BORROWER ? (
              <div className=" text-lavender bg-primary/20 rounded-lg px-4 py-2 text-sm font-medium text-center w-full">
                You cannot Lend assets while you have an active borrowing
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
                  className="w-1/2"
                  disabled={!account || !balance?.gt(0)}
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                  }}
                >
                  Supply
                </Button>
                <Button
                  className="w-1/2"
                  disabled={
                    !account ||
                    !userSupplyBorrow ||
                    userSupplyBorrow.supplied.eq(0)
                  }
                  variant={'secondary'}
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
                  }}
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
