import BigNumber from 'bignumber.js';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { appConfig } from '@/configs';
import {
  useApr,
  useMarketConfiguration,
  usePrice,
  useUserSupplyBorrow,
} from '@/hooks/v1';
import {
  ACTION_TYPE,
  MARKET_MODE,
  useMarketStore,
} from '@/stores/market-store';
import {
  createStableHash,
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
  </TableRow>
);

export const Liquidity = () => {
  const rows = Object.keys(appConfig.client.v1.markets).map((market) => (
    <LiquidityRow key={market} market={market} />
  ));

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
        <TableRow className="hidden last:table-row">
          <TableCell colSpan={8}>
            <div className="flex w-full items-center justify-center font-semibold text-md text-moon">
              No earn position open.
            </div>
          </TableCell>
        </TableRow>
        {rows}
      </TableBody>
    </Table>
  );
};

const LiquidityRow = ({ market }: { market: string }) => {
  const { data: userSupplyBorrow, isPending: isPendingUserSupplyBorrow } =
    useUserSupplyBorrow(market);
  const { data: priceData, isPending: isPendingPriceData } = usePrice(market);
  const { data: aprData, isPending: isAprPending } = useApr(market);
  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration(market);

  const isLoading = useMemo(() => {
    return [
      isPendingMarketConfiguration,
      isPendingUserSupplyBorrow,
      isPendingPriceData,
      isAprPending,
    ].some((res) => res);
  }, [
    isPendingMarketConfiguration,
    isPendingUserSupplyBorrow,
    isPendingPriceData,
    isAprPending,
  ]);

  const supplied = useMemo(() => {
    if (!(userSupplyBorrow && marketConfiguration)) {
      return null;
    }
    const res = formatUnits(
      userSupplyBorrow.supplied,
      marketConfiguration.baseTokenDecimals
    );

    if (res.eq(0)) {
      return null;
    }
    return res;
  }, [
    createStableHash(userSupplyBorrow),
    createStableHash(marketConfiguration),
  ]);

  const suppliedPrice = useMemo(() => {
    if (!(priceData && supplied && marketConfiguration)) {
      return BigNumber(0);
    }
    return priceData.prices[marketConfiguration?.baseToken.bits].times(
      supplied
    );
  }, [
    createStableHash(priceData),
    createStableHash(marketConfiguration),
    supplied?.toString(),
  ]);

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

  if (isLoading) {
    return SkeletonRow(market);
  }

  if (!supplied || supplied.toNumber() < 0.01) {
    return null;
  }
  if (supplied) {
    return (
      <TableRow>
        <TableCell>
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
          <span className="font-medium text-lavender">
            {getFormattedPrice(suppliedPrice)}
          </span>{' '}
          {supplied.toFixed(2)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-x-2 font-medium text-md text-primary underline">
            <div>{aprData?.supplyBaseApr.times(100).toFixed(2)}%</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-x-1 text-primary">
            <Image
              alt={market}
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
                    marketConfiguration?.baseToken.bits ?? '',
                    market
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
                    marketConfiguration?.baseToken.bits ?? '',
                    market
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
    );
  }

  return null;
};
