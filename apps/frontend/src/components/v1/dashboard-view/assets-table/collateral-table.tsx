import { useAccount } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { AssetName } from '@/components/v1/asset-name';
import { CircularProgressBar } from '@/components/v1/circular-progress-bar';
import { InfoIcon } from '@/components/v1/info-icon';
import { PointIcons } from '@/components/v1/point-icons';
import { POINTS_COLLATERAL } from '@/components/v1/point-icons/points-tooltip';
import { Title } from '@/components/v1/title';
import { appConfig } from '@/configs';
import type { CollateralConfigurationOutput } from '@/contract-types/v1/Market';
import {
  useBalance,
  useCollateralConfigurations,
  usePrice,
  useTotalCollateral,
  useUserCollateralAssets,
} from '@/hooks/v1';
import { ACTION_TYPE, useMarketStore } from '@/stores/market-store';
import {
  formatUnits,
  getFormattedNumber,
  getFormattedPrice,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
} from '@/utils';

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
    assetId,
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
            <TooltipTrigger
              className="cursor-pointer"
              onClick={(e) => e.preventDefault()}
            >
              <AssetName
                name={SYMBOL_TO_NAME[symbol]}
                src={SYMBOL_TO_ICON[symbol]}
                symbol={symbol}
              />
            </TooltipTrigger>
            <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
              <div className="w-[300px] p-2">
                <div className="font-bold text-lg">Collateral Details</div>
                <div className="mt-2 flex flex-col gap-y-2">
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Oracle Price</div>
                    <div className="font-semibold text-moon">
                      ${price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Supply Cap</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(
                        formatUnits(
                          BigNumber(
                            collateralConfiguration.supply_cap.toString()
                          ),
                          decimals
                        ),
                        2
                      )}{' '}
                      {appConfig.client.shared.assets[assetId]}
                    </div>
                  </div>
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Total Supplied</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(collateralAmount, 2)}{' '}
                      {appConfig.client.shared.assets[assetId]}
                    </div>
                  </div>
                  <div className="flex justify-between text-md">
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
                  <div className="flex justify-between text-md">
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
                  <div className="flex justify-between text-md">
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
                  <div className="flex justify-between text-md">
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
      <TableCell className="text-moon">
        {formattedBalance} {symbol}
      </TableCell>
      <TableCell>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger onClick={(e) => e.preventDefault()}>
              <div className="h-[48px] w-[48px] cursor-pointer">
                <CircularProgressBar percent={supplyUsed.div(100)} />
              </div>
            </TooltipTrigger>
            <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
              <div className="w-[300px] p-2">
                <div className="font-bold text-lg">
                  Collateral Supply Details
                </div>
                <div className="mt-2 flex flex-col gap-y-2">
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Supply Cap</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(
                        formatUnits(
                          BigNumber(
                            collateralConfiguration.supply_cap.toString()
                          ),
                          decimals
                        ),
                        2
                      )}{' '}
                      {appConfig.client.shared.assets[assetId]}
                    </div>
                  </div>
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Supply Cap Value</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(
                        formatUnits(
                          BigNumber(
                            collateralConfiguration.supply_cap.toString()
                          ),
                          decimals
                        ).times(price)
                      )}
                      {' $'}
                    </div>
                  </div>
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Total Supplied</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(collateralAmount, 2)}{' '}
                      {appConfig.client.shared.assets[assetId]}
                    </div>
                  </div>
                  <div className="flex justify-between text-md">
                    <div className="text-lavender">Total Supplied Value</div>
                    <div className="font-semibold text-moon">
                      {getFormattedNumber(collateralAmount.times(price))}
                      {' $'}
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex h-full items-center gap-x-2 text-moon">
          <span className="font-medium text-lavender">
            {getFormattedPrice(
              formatUnits(protocolBalance, decimals).times(price)
            )}
          </span>
          {getFormattedNumber(formatUnits(protocolBalance, decimals))} {symbol}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex h-full items-center gap-x-2">
          <PointIcons points={POINTS_COLLATERAL} />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex w-full gap-x-2">
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
            onMouseDown={() =>
              canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
            }
            variant={'secondary'}
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
    assetId,
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
        <div className="flex flex-col gap-y-4 px-4 pt-8">
          <div className="flex w-full items-center">
            <div className="w-1/2 font-medium text-moon">Collateral Asset</div>
            <AssetName
              name={SYMBOL_TO_NAME[symbol]}
              src={SYMBOL_TO_ICON[symbol]}
              symbol={symbol}
            />
          </div>
          <div className="flex w-full items-center">
            <div className="w-1/2 font-medium text-moon">Wallet Balance</div>
            <div className="text-moon">
              {formattedBalance} {symbol}
            </div>
          </div>
          <div className="flex w-full items-center">
            <div className="w-1/2 font-medium text-moon">
              Supply Cap
              <br />
              Reached
            </div>
            <div className="flex h-[48px] w-[30%] items-center gap-x-2">
              {Number(supplyUsed.decimalPlaces(1))}%
              <Progress className="h-4" value={Number(supplyUsed)} />
            </div>
          </div>
          <div className="flex w-full items-center">
            <div className="w-1/2 font-medium text-moon">
              Your Supplied Collateral
            </div>
            <div className="flex items-center gap-x-2 text-moon">
              <span className="font-medium text-lavender">
                {getFormattedPrice(
                  formatUnits(protocolBalance, decimals).times(price)
                )}
              </span>
              {getFormattedNumber(formatUnits(protocolBalance, decimals))}{' '}
              {symbol}
            </div>
          </div>
          <div className="flex w-full items-center">
            <div className="w-1/2 font-medium text-moon">Supply Points</div>
            <PointIcons mobile points={POINTS_COLLATERAL} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-x-2">
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
            onMouseDown={() =>
              canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
            }
            variant={'secondary'}
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

export const CollateralTable = () => {
  const { account } = useAccount();
  const changeAction = useMarketStore.use.changeAction();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeMode = useMarketStore.use.changeMode();
  const changeActionTokenAssetId =
    useMarketStore.use.changeActionTokenAssetId();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();

  const {
    data: userCollateralAssets,
    isPending: isPendingUserCollateralAssets,
  } = useUserCollateralAssets();

  const { data: collateralBalances } = useTotalCollateral();

  const { data: priceData } = usePrice();

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

  return (
    <>
      <Table className="mt-8 max-lg:hidden">
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
          ) : collaterals.length === 0 ? (
            <TableRow>
              <TableCell className="py-4 text-center" colSpan={5}>
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
                  account={account ?? undefined}
                  assetId={collateral.asset_id.bits}
                  collateralAmount={formatUnits(
                    collateralAmount,
                    collateral.decimals
                  )}
                  collateralConfiguration={
                    collateralConfigurations![collateral.asset_id.bits]
                  }
                  decimals={collateral.decimals}
                  handleAssetClick={handleAssetClick}
                  key={collateral.asset_id.bits}
                  price={
                    priceData?.prices[collateral.asset_id.bits] ??
                    new BigNumber(0)
                  }
                  protocolBalance={
                    userCollateralAssets?.[collateral.asset_id.bits] ??
                    new BigNumber(0)
                  }
                  protocolBalancePending={isPendingUserCollateralAssets}
                  symbol={
                    appConfig.client.shared.assets[collateral.asset_id.bits]
                  }
                />
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="mt-8 flex flex-col gap-y-4 px-4 lg:hidden">
        <Title>Collateral Assets</Title>
        {isPendingCollateralConfigurations ? (
          <Skeleton className="h-[100px] w-full rounded-md bg-primary/20" />
        ) : (
          <div className="flex flex-col gap-y-4">
            {collaterals.map((collateral) => {
              const collateralAmount =
                collateralBalances?.get(collateral.asset_id.bits) ??
                BigNumber(0);
              return (
                <CollateralCard
                  account={account ?? undefined}
                  assetId={collateral.asset_id.bits}
                  collateralAmount={formatUnits(
                    collateralAmount,
                    collateral.decimals
                  )}
                  collateralConfiguration={
                    collateralConfigurations![collateral.asset_id.bits]
                  }
                  decimals={collateral.decimals}
                  handleAssetClick={handleAssetClick}
                  key={collateral.asset_id.bits}
                  price={
                    priceData?.prices[collateral.asset_id.bits] ??
                    new BigNumber(0)
                  }
                  protocolBalance={
                    userCollateralAssets?.[collateral.asset_id.bits] ??
                    new BigNumber(0)
                  }
                  protocolBalancePending={isPendingUserCollateralAssets}
                  symbol={
                    appConfig.client.shared.assets[collateral.asset_id.bits]
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
