import { AssetName } from '@/components/AssetName';
import { CircularProgressBar } from '@/components/CircularProgressBar';
import { InfoIcon } from '@/components/InfoIcon';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { appConfig } from '@/configs';
import type { CollateralConfigurationOutput } from '@/contract-types/Market';
import {
  useBalance,
  useCollateralConfigurations,
  usePrice,
  useTotalCollateral,
  useUserCollateralAssets,
} from '@/hooks';
import {
  ACTION_TYPE,
  selectChangeAction,
  selectChangeActionTokenAssetId,
  selectChangeInputDialogOpen,
  selectChangeMode,
  selectChangeTokenAmount,
  useMarketStore,
} from '@/stores';
import {
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
  getFormattedNumber,
  getFormattedPrice,
} from '@/utils';
import { useAccount } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

type TableRowProps = {
  account: string | undefined;
  assetId: string;
  symbol: string;
  decimals: number;
  protocolBalance: BigNumber;
  protocolBalancePending: boolean;
  handleAssetClick: (action: ACTION_TYPE, assetId: string) => void;
  collateralConfiguration: CollateralConfigurationOutput;
  collateralAmount: BigNumber;
  price: BigNumber;
};

const POINTS_COLLATERAL: Point[] = [
  {
    id: '1',
    name: 'Passive Points',
    description: (
      <div className="text-md">
        Supply this asset as collateral to earn 1 Fuel Point per dollar value.
        <br /> Earn up to a <span className="text-primary">2x</span> multiplier
        if the collateral is actively used for borrowing.
        <br />
        <br />
        For more details, check out our{' '}
        <a
          href="https://swaylend.medium.com/incentivizing-useful-liquidity-on-swaylend-with-fuel-points-c2308be4b4c6"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          blog post
        </a>
        .
      </div>
    ),
    icon: SYMBOL_TO_ICON.FUEL,
  },
  {
    id: '2',
    name: 'Passive Points',
    description: (
      <div className="text-md">
        Supply this asset as collateral to earn 1 Fuel Point per dollar value.
        <br />
        <br />
        For more details, check out our{' '}
        <a
          href="https://swaylend.medium.com/incentivizing-useful-liquidity-on-swaylend-with-fuel-points-c2308be4b4c6"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          blog post
        </a>
        .
      </div>
    ),
    icon: SYMBOL_TO_ICON.FUEL,
  },
  // {
  //   id: '2',
  //   name: 'Swaylend',
  //   description: 'Earn Swaylend Points by lending assets',
  //   icon: SYMBOL_TO_ICON.SWAY,
  // },
];

const CollateralTableRow = ({
  account,
  assetId,
  symbol,
  decimals,
  protocolBalance,
  handleAssetClick,
  collateralConfiguration,
  collateralAmount,
  price,
}: TableRowProps) => {
  const { data: balance } = useBalance({
    address: account,
    assetId: assetId,
  });

  const formattedBalance = getFormattedNumber(
    formatUnits(BigNumber(balance ? balance.toString() : '0'), decimals)
  );

  const canWithdraw = protocolBalance.gt(0);

  let supplyUsed = BigNumber(0);
  if (collateralAmount.gt(0)) {
    supplyUsed = collateralAmount
      .div(
        formatUnits(
          BigNumber(collateralConfiguration.supply_cap.toString()),
          decimals
        )
      )
      .times(100);
  }

  const canSupply = balance?.gt(0) && supplyUsed.lt(100);

  return (
    <TableRow>
      <TableCell>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger onClick={(e) => e.preventDefault()}>
              <AssetName
                symbol={symbol}
                name={SYMBOL_TO_NAME[symbol]}
                src={SYMBOL_TO_ICON[symbol]}
              />
            </TooltipTrigger>
            <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
              <div className="p-2 w-[250px]">
                <div className="font-bold text-lg">Collateral Details</div>
                <div className="flex flex-col gap-y-2 mt-2">
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Oracle Price</div>
                    <div className="font-semibold text-moon">
                      ${price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Supply Cap</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(
                        formatUnits(
                          BigNumber(
                            collateralConfiguration.supply_cap.toString()
                          ),
                          decimals
                        )
                      )}{' '}
                      {appConfig.assets[assetId]}
                    </div>
                  </div>
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Total Supplied</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(collateralAmount)}{' '}
                      {appConfig.assets[assetId]}
                    </div>
                  </div>
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Collateral Factor</div>
                    <div className="font-semibold text-moon">
                      {formatUnits(
                        BigNumber(
                          collateralConfiguration.borrow_collateral_factor.toString()
                        ).times(100),
                        18
                      ).toFormat(0)}
                      %
                    </div>
                  </div>
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Liquidation Factor</div>
                    <div className="font-semibold text-moon">
                      {formatUnits(
                        BigNumber(
                          collateralConfiguration.liquidate_collateral_factor.toString()
                        ).times(100),
                        18
                      ).toFormat(0)}
                      %
                    </div>
                  </div>
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Liquidation Penalty</div>
                    <div className="font-semibold text-moon">
                      {BigNumber(100)
                        .minus(
                          formatUnits(
                            BigNumber(
                              collateralConfiguration.liquidation_penalty.toString()
                            ),
                            16
                          )
                        )
                        .toFormat(0)}
                      %
                    </div>
                  </div>
                  <div className="text-md flex justify-between">
                    <div className="text-lavender">Collateral Active</div>
                    <div className="font-semibold text-moon">
                      {collateralConfiguration.paused ? 'No' : 'Yes'}
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        {formattedBalance} {symbol}
      </TableCell>
      <TableCell>
        <div className="w-[48px] h-[48px]">
          <CircularProgressBar percent={supplyUsed.div(100)} />
        </div>
      </TableCell>
      <TableCell>
        <div className=" h-full flex items-center gap-x-2">
          <span className="text-lavender font-medium">
            {getFormattedPrice(
              formatUnits(protocolBalance, decimals).times(price)
            )}
          </span>
          {getFormattedNumber(formatUnits(protocolBalance, decimals))} {symbol}
        </div>
      </TableCell>
      <TableCell>
        <PointIcons
          value={symbol === 'USDT' || symbol === 'ETH' ? '2x' : undefined}
          points={
            symbol === 'USDT' || symbol === 'ETH'
              ? [POINTS_COLLATERAL[0]]
              : [POINTS_COLLATERAL[1]]
          }
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-x-2 w-full">
          <Button
            className="w-1/2"
            disabled={!canSupply}
            onMouseDown={() =>
              canSupply && handleAssetClick(ACTION_TYPE.SUPPLY, assetId)
            }
          >
            Supply
          </Button>
          <Button
            className="w-1/2"
            disabled={!canWithdraw}
            variant={'secondary'}
            onMouseDown={() =>
              canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
            }
          >
            Withdraw
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const CollateralCard = ({
  account,
  assetId,
  symbol,
  decimals,
  protocolBalance,
  handleAssetClick,
  collateralAmount,
  collateralConfiguration,
  price,
}: TableRowProps) => {
  const { data: balance } = useBalance({
    address: account,
    assetId: assetId,
  });

  const formattedBalance = getFormattedNumber(
    formatUnits(BigNumber(balance ? balance.toString() : '0'), decimals)
  );

  let supplyUsed = BigNumber(0);
  if (collateralAmount.gt(0)) {
    supplyUsed = collateralAmount
      .div(
        formatUnits(
          BigNumber(collateralConfiguration.supply_cap.toString()),
          decimals
        )
      )
      .times(100);
  }

  const canSupply = balance?.gt(0) && supplyUsed.lt(100);
  const canWithdraw = protocolBalance.gt(0);
  return (
    <Card>
      <VisuallyHidden.Root asChild>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </VisuallyHidden.Root>
      <CardContent>
        <div className="flex flex-col gap-y-4 pt-8 px-4">
          <div className="w-full flex items-center">
            <div className="w-1/2 text-moon font-medium">Collateral Asset</div>
            <AssetName
              symbol={symbol}
              name={SYMBOL_TO_NAME[symbol]}
              src={SYMBOL_TO_ICON[symbol]}
            />
          </div>
          <div className="w-full flex items-center">
            <div className="w-1/2 text-moon font-medium">Wallet Balance</div>
            <div className="text-moon">
              {formattedBalance} {symbol}
            </div>
          </div>
          <div className="w-full flex items-center">
            <div className="w-1/2 text-moon font-medium">
              Supply Cap Reached
            </div>
            <div className="w-[48px] h-[48px]">
              <CircularProgressBar percent={supplyUsed.div(100)} />
            </div>
          </div>
          <div className="w-full flex items-center">
            <div className="w-1/2 text-moon font-medium">
              Your Supplied Collateral
            </div>
            <div className=" text-moon flex items-center gap-x-2">
              <span className="text-lavender font-medium">
                {getFormattedPrice(
                  formatUnits(protocolBalance, decimals).times(price)
                )}
              </span>
              {getFormattedNumber(formatUnits(protocolBalance, decimals))}{' '}
              {symbol}
            </div>
          </div>
          <div className="w-full flex items-center">
            <div className="w-1/2 text-moon font-medium">Supply Points</div>
            <PointIcons points={POINTS_COLLATERAL} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-x-2 w-full">
          <Button
            className="w-1/2"
            disabled={!canSupply}
            onMouseDown={() =>
              canSupply && handleAssetClick(ACTION_TYPE.SUPPLY, assetId)
            }
          >
            Supply
          </Button>
          <Button
            className="w-1/2"
            disabled={!canWithdraw}
            variant={'secondary'}
            onMouseDown={() =>
              canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
            }
          >
            Withdraw
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

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

export const CollateralTable = () => {
  const { account } = useAccount();
  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeMode = useMarketStore(selectChangeMode);
  const changeActionTokenAssetId = useMarketStore(
    selectChangeActionTokenAssetId
  );
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);

  const {
    data: userCollateralAssets,
    isPending: isPendingUserCollateralAssets,
  } = useUserCollateralAssets();

  const { data: collateralBalances } = useTotalCollateral();

  const { data: priceData, isPending: isPendingPriceData } = usePrice();

  const {
    data: collateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations();

  const collaterals = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations);
  }, [collateralConfigurations]);

  const handleAssetClick = (action: ACTION_TYPE, assetId: string) => {
    changeTokenAmount(new BigNumber(0));
    changeAction(action);
    changeMode(0);
    changeActionTokenAssetId(assetId);
    changeInputDialogOpen(true);
  };

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

  return (
    <>
      <Table className="max-lg:hidden mt-8">
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/12">
              <div className="flex items-center gap-x-2">
                Collateral Asset
                <InfoIcon
                  text={
                    'Assets you can deposit to secure borrowing positions and back your loans.'
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-2/12">Wallet Balance</TableHead>
            <TableHead className="w-2/12">
              <div className="flex items-center gap-x-2">
                Supply Cap Filled
                <InfoIcon
                  text={
                    'Percentage of the limited supply that has been filled.'
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-2/12">Your Supplied Collateral</TableHead>
            <TableHead className="w-1/12">
              <div className="flex items-center gap-x-2">
                Points
                <InfoIcon
                  text={
                    'Points earned for providing incentivized asset as a collateral. Hover over the points to learn more.'
                  }
                />
              </div>
            </TableHead>
            <TableHead className="w-3/12">{}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPendingCollateralConfigurations ? (
            SkeletonRow
          ) : (
            <>
              {collaterals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No collateral assets found
                  </TableCell>
                </TableRow>
              ) : (
                collaterals.map((collateral) => {
                  const collateralAmount =
                    collateralBalances?.get(collateral.asset_id.bits) ??
                    BigNumber(0);
                  return (
                    <CollateralTableRow
                      key={collateral.asset_id.bits}
                      account={account ?? undefined}
                      assetId={collateral.asset_id.bits}
                      symbol={appConfig.assets[collateral.asset_id.bits]}
                      decimals={collateral.decimals}
                      protocolBalance={
                        userCollateralAssets?.[collateral.asset_id.bits] ??
                        new BigNumber(0)
                      }
                      protocolBalancePending={isPendingUserCollateralAssets}
                      handleAssetClick={handleAssetClick}
                      collateralConfiguration={
                        collateralConfigurations![collateral.asset_id.bits]
                      }
                      collateralAmount={formatUnits(
                        collateralAmount,
                        collateral.decimals
                      )}
                      price={
                        priceData?.prices[collateral.asset_id.bits] ??
                        new BigNumber(0)
                      }
                    />
                  );
                })
              )}
            </>
          )}
        </TableBody>
      </Table>

      <div className="mt-8 flex flex-col gap-y-4 px-4 lg:hidden">
        <Title>Collateral Assets</Title>
        {isPendingCollateralConfigurations ? (
          <Skeleton className="w-full h-[100px] bg-primary/20 rounded-md" />
        ) : (
          <div className="flex flex-col gap-y-4">
            {collaterals.map((collateral) => {
              const collateralAmount =
                collateralBalances?.get(collateral.asset_id.bits) ??
                BigNumber(0);
              return (
                <CollateralCard
                  key={collateral.asset_id.bits}
                  account={account ?? undefined}
                  assetId={collateral.asset_id.bits}
                  symbol={appConfig.assets[collateral.asset_id.bits]}
                  decimals={collateral.decimals}
                  protocolBalance={
                    userCollateralAssets?.[collateral.asset_id.bits] ??
                    new BigNumber(0)
                  }
                  protocolBalancePending={isPendingUserCollateralAssets}
                  handleAssetClick={handleAssetClick}
                  collateralConfiguration={
                    collateralConfigurations![collateral.asset_id.bits]
                  }
                  collateralAmount={formatUnits(
                    collateralAmount,
                    collateral.decimals
                  )}
                  price={
                    priceData?.prices[collateral.asset_id.bits] ??
                    new BigNumber(0)
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
