import { type Point, PointIcons } from '@/components/PointIcons';
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
  USER_ROLE,
  useMarketConfiguration,
  useSupplyRate,
  useUserRole,
  useUserSupplyBorrow,
} from '@/hooks';
import { cn } from '@/lib/utils';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import {
  ASSET_ID_TO_SYMBOL,
  SYMBOL_TO_ICON,
  formatUnits,
  getSupplyApr,
} from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import React from 'react';

const POINTS_LEND: Point[] = [
  {
    id: '1',
    name: 'Fuel',
    description: 'Earn Fuel Points by lending assets',
    icon: SYMBOL_TO_ICON.FUEL,
  },
  {
    id: '2',
    name: 'SwayLend',
    description: 'Earn SwayLend Points by lending assets',
    icon: SYMBOL_TO_ICON.SWAY,
  },
];

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
        <div className="w-1/2 text-moon font-medium">Lend Asset</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Lend APY</div>
        <Skeleton className="w-1/2 h-[24px] bg-primary/20 rounded-md" />
      </div>
      <div className="w-full flex items-center">
        <div className="w-1/2 text-moon font-medium">Supplied Assets</div>
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
  const {
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
    changeInputDialogOpen,
  } = useMarketStore();

  const { data: supplyRate, isPending: isSupplyRatePending } = useSupplyRate();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration();

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeActionTokenAssetId(marketConfiguration?.baseToken);
    changeInputDialogOpen(true);
  };

  const { balance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken,
  });

  const userRole = useUserRole();

  return (
    <>
      {/* DESKTOP */}
      <Table className="max-sm:hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/12">Lend Asset</TableHead>
            <TableHead className="w-1/6">Lend APY</TableHead>
            <TableHead className="w-1/6">Supplied Assets</TableHead>
            <TableHead className="w-1/6">Supply Points</TableHead>
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
                            ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken]
                          ]
                        }
                        alt={ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken]}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    {marketConfiguration && (
                      <div className="text-white font-medium">
                        {ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken]}
                      </div>
                    )}
                    <div>
                      {formatUnits(
                        balance ? BigNumber(balance.toString()) : BigNumber(0),
                        marketConfiguration?.baseTokenDecimals ?? 9
                      ).toFixed(2)}{' '}
                      {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
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
                {formatUnits(
                  userSupplyBorrow?.supplied ?? BigNumber(0),
                  marketConfiguration?.baseTokenDecimals ?? 9
                ).toFormat(2)}{' '}
                {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
              </TableCell>
              <TableCell>
                <PointIcons points={POINTS_LEND} />
              </TableCell>
              <TableCell>
                {userRole === USER_ROLE.BORROWER ? (
                  <div className="text-lavender text-md font-medium text-center w-full">
                    Repay your debt to supply base asset!
                  </div>
                ) : (
                  <div className="flex gap-x-2 w-full">
                    <Button
                      className="w-1/2"
                      disabled={!account}
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
      <div className="flex flex-col gap-y-4 px-4 sm:hidden">
        <Title>Lend Assets</Title>
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
                  <div className="w-1/2 text-moon font-medium">Lend Asset</div>
                  <div className="flex gap-x-2 items-center">
                    <div>
                      {marketConfiguration && (
                        <Image
                          src={
                            SYMBOL_TO_ICON[
                              ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken]
                            ]
                          }
                          alt={
                            ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken]
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
                          {ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken]}
                        </div>
                      )}
                      <div className="text-moon text-sm">
                        {formatUnits(
                          balance
                            ? BigNumber(balance.toString())
                            : BigNumber(0),
                          marketConfiguration?.baseTokenDecimals ?? 9
                        ).toFixed(2)}
                        {' in wallet'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex items-center">
                  <div className="w-1/2 text-moon font-medium">Lend APY</div>
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
                    Supplied Assets
                  </div>
                  <div className="text-moon">
                    {formatUnits(
                      userSupplyBorrow?.supplied ?? BigNumber(0),
                      marketConfiguration?.baseTokenDecimals ?? 9
                    ).toFormat(2)}{' '}
                    {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
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
              <div className="text-lavender text-md font-medium text-center w-full">
                Repay your debt to supply base asset!
              </div>
            ) : (
              <div className="flex gap-x-2 w-full">
                <Button
                  className="w-1/2"
                  disabled={!account}
                  onMouseDown={() => {
                    handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                  }}
                >
                  Supply
                </Button>
                <Button
                  className="w-1/2"
                  disabled={!account}
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
