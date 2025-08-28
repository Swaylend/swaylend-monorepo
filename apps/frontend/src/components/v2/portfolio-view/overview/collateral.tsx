import BigNumber from 'bignumber.js';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetName } from '@/components/v2/asset-name';
import { appConfig } from '@/configs';
import {
  useApr,
  useCollateralConfigurations,
  usePriceData,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserLiquidationPoint,
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

type TableRowProps = {
  market: string;
  assetId: string;
  value: string;
  amount: BigNumber;
  apy: any;
  liquidationRisk: number;
  liquidationPoint: BigNumber;
};

const CollateralTableRow = ({
  market,
  assetId,
  value,
  amount,
  liquidationRisk,
  liquidationPoint,
}: TableRowProps) => {
  const symbol = appConfig.client.shared.assets[assetId];

  const changeAction = useMarketStore.use.changeAction();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeActionTokenAssetId =
    useMarketStore.use.changeActionTokenAssetId();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();
  const changeMarketMode = useMarketStore.use.changeMarketMode();
  const changeMarket = useMarketStore.use.changeMarket();

  const handleCollateralTokenClick = (
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
    <TableRow>
      <TableCell className="bg-card font-semibold text-white">
        <div className="flex items-center gap-x-2">
          <div>
            <Image
              alt={market}
              className={'rounded-full'}
              height={32}
              src={SYMBOL_TO_ICON[market]}
              width={32}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-x-2">
              <div className="font-semibold text-md text-white">
                {SYMBOL_TO_NAME[market]}
              </div>
              <div className="font-semibold text-moon text-sm">{market}</div>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <AssetName
          name={SYMBOL_TO_NAME[symbol]}
          src={SYMBOL_TO_ICON[symbol]}
          symbol={symbol}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-x-2">
          <span className="font-medium text-lavender">{value}</span>
          <span>
            {amount.toFixed(2)} {symbol}
          </span>
        </div>
      </TableCell>
      <TableCell
        className={`bg-card font-semibold ${liquidationRisk > 80 && 'text-red-500'} ${liquidationRisk > 60 && liquidationRisk <= 80 && 'text-yellow-500'} ${liquidationRisk <= 60 && 'text-primary'}`}
      >
        {liquidationRisk}%
      </TableCell>
      <TableCell className="font-medium text-white">
        {getFormattedPrice(liquidationPoint ?? BigNumber(0))}
      </TableCell>
      <TableCell className="bg-card font-semibold text-white">
        <div className="flex items-center gap-x-1 text-primary">
          <Image
            alt={'SWAY'}
            className={'rounded-full'}
            height={24}
            src={SYMBOL_TO_ICON.SWAY}
            width={24}
          />
        </div>
      </TableCell>
      <TableCell className="flex gap-x-2 bg-card font-semibold text-white">
        <Link href="/">
          <Button
            onMouseDown={() => {
              handleCollateralTokenClick(ACTION_TYPE.SUPPLY, assetId, market);
            }}
          >
            +
          </Button>
        </Link>
        <Link href="/">
          <Button
            onMouseDown={() => {
              handleCollateralTokenClick(ACTION_TYPE.WITHDRAW, assetId, market);
            }}
            variant={'secondary'}
          >
            -
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
};

const SkeletonRow = (key: string) => (
  <TableRow key={key}>
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

export const Collateral = () => {
  const rows = Object.keys(appConfig.client.v2.markets).map((market) => (
    <CollateralRow key={market} market={market} />
  ));

  return (
    <Table className="mt-12 max-lg:hidden">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-white">
              Collateral
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Market
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Collateral Asset
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-semibold text-moon">
            Assets
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
        <TableRow className="hidden last:table-row">
          <TableCell colSpan={8}>
            <div className="flex w-full items-center justify-center font-semibold text-md text-moon">
              No collateral supplied.
            </div>
          </TableCell>
        </TableRow>
        {rows}
      </TableBody>
    </Table>
  );
};

const CollateralRow = ({ market }: { market: string }): ReactNode => {
  const { data: priceData, isPending: isPendingPriceData } =
    usePriceData(market);
  const {
    data: userCollateralAssets,
    isPending: isPendingUserCollateralAssets,
  } = useUserCollateralAssets(market);
  const {
    data: colateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations(market);
  const { data: aprData, isPending: isAprPending } = useApr(market);
  const { data: collateralUtilization, isPending: isPendingColUtil } =
    useUserCollateralUtilization(market);

  const currentCollateralUtilization = useMemo(() => {
    return Number(collateralUtilization?.times(100).toFixed(2));
  }, [collateralUtilization]);

  const { data: userLiquidationPoint, isPending: isPendingLP } =
    useUserLiquidationPoint();

  const isLoading = useMemo(() => {
    return [
      isPendingCollateralConfigurations,
      isPendingUserCollateralAssets,
      isPendingPriceData,
      isAprPending,
      isPendingColUtil,
      isPendingLP,
    ].some((x) => x);
  }, [
    isPendingCollateralConfigurations,
    isPendingUserCollateralAssets,
    isPendingPriceData,
    isAprPending,
    isPendingColUtil,
    isPendingLP,
  ]);

  const suppliedCollaterals = useMemo(() => {
    if (!(priceData && userCollateralAssets && colateralConfigurations))
      return [];

    const assetIDs = Object.keys(userCollateralAssets);

    return assetIDs
      .filter((assetId) => {
        if (userCollateralAssets[assetId].isZero()) return false;
        return true;
      })
      .map((assetId) => {
        const amount = formatUnits(
          userCollateralAssets[assetId],
          colateralConfigurations[assetId].decimals
        );
        const assetPrice =
          priceData.prices.get(assetId)?.[0]?.price ?? BigNumber(0);
        const value = getFormattedPrice(assetPrice.times(amount));
        return { market, assetId, value, amount };
      });
  }, [priceData, userCollateralAssets, colateralConfigurations]);

  if (isLoading) {
    return SkeletonRow(market);
  }

  if (suppliedCollaterals.length === 0) {
    return null;
  }

  return suppliedCollaterals.map((collateral) => (
    <CollateralTableRow
      amount={collateral.amount}
      apy={aprData}
      assetId={collateral.assetId}
      key={`${market}-${collateral.assetId}`}
      liquidationPoint={userLiquidationPoint ?? BigNumber(0)}
      liquidationRisk={currentCollateralUtilization}
      market={collateral.market}
      value={collateral.value}
    />
  ));
};
