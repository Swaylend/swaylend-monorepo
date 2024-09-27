'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import {
  useBorrowRate,
  useCollateralConfigurations,
  useMarketBasics,
  useMarketConfiguration,
  usePrice,
  useSupplyRate,
  useTotalCollateral,
  useUtilization,
} from '@/hooks';
import {
  ASSET_ID_TO_SYMBOL,
  type DeployedMarket,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
  getBorrowApr,
  getSupplyApr,
} from '@/utils';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import type React from 'react';

import { formatCurrency } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import SWAY from '/public/tokens/sway.svg?url';
import { CircularProgressBar } from '../CircularProgressBar';
import { type Point, PointIcons } from '../PointIcons';
import { Skeleton } from '../ui/skeleton';
import { CollateralIcons } from '../CollateralIcons';

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
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
  </TableRow>
);

export const MarketTableRow = ({
  marketName,
}: {
  marketName: string;
}): React.ReactElement => {
  const router = useRouter();
  const { data: marketConfiguration } = useMarketConfiguration();

  const { data: utilization } = useUtilization(marketName as DeployedMarket);
  const { data: borrowRate } = useBorrowRate(marketName as DeployedMarket);
  const { data: supplyRate } = useSupplyRate(marketName as DeployedMarket);
  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);
  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  const {
    data: collateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations(marketName as DeployedMarket);

  const collaterals = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations).map((collateral) => ({
      symbol: ASSET_ID_TO_SYMBOL[collateral.asset_id],
    }));
  }, [collateralConfigurations]);

  const collateralIcons: Point[] = collaterals.map((collateral) => ({
    id: collateral.symbol,
    name: collateral.symbol,
    description: '',
    icon: SYMBOL_TO_ICON[collateral.symbol] || SWAY,
  }));

  const { data: marketBasics } = useMarketBasics(marketName as DeployedMarket);

  const { data: totalCollateral } = useTotalCollateral(
    marketName as DeployedMarket
  );

  const { data: priceData } = usePrice(marketName as DeployedMarket);

  const totalCollateralValue = useMemo(() => {
    if (!priceData || !totalCollateral || !collateralConfigurations) {
      return BigNumber(0);
    }

    return Array.from(totalCollateral.entries()).reduce(
      (sum, [assetId, value]) => {
        if (!collateralConfigurations[assetId]) return sum;
        const assetPrice = priceData.prices[assetId] ?? BigNumber(0);
        return sum.plus(
          assetPrice.times(
            value.div(
              BigNumber(10).pow(collateralConfigurations[assetId].decimals)
            )
          )
        );
      },
      BigNumber(0)
    );
  }, [totalCollateral, priceData]);

  return isPendingCollateralConfigurations ? (
    SkeletonRow
  ) : (
    <TableRow
      className="hover:bg-secondary cursor-pointer"
      onClick={() => router.push(`/market/fuel-${marketName}`)}
    >
      <TableCell>
        <div className="flex gap-x-2 items-center">
          <div>
            <Image
              src={SYMBOL_TO_ICON[marketName]}
              alt={marketName}
              width={32}
              height={32}
              className={'rounded-full'}
            />
          </div>
          <div>
            <div className="flex gap-x-2 items-baseline">
              <div className="text-white text-md font-semibold">
                {SYMBOL_TO_NAME[marketName]}
              </div>
              <div className="text-sm font-semibold text-moon">
                {marketName}
              </div>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <CollateralIcons collaterals={collateralIcons} />
      </TableCell>
      <TableCell>
        <div className="w-[48px] h-[48px]">
          {
            <CircularProgressBar
              percent={Number(
                formatUnits(BigNumber(utilization?.toString()!), 18).toFixed(
                  2,
                  1
                )
              )}
            />
          }
        </div>
      </TableCell>
      <TableCell>
        <div className="text-lavender font-medium">{supplyApr}</div>
      </TableCell>
      <TableCell>
        <div className="text-lavender font-medium">{borrowApr}</div>
      </TableCell>
      <TableCell className="text-lavender font-medium">
        $
        {formatCurrency(
          Number(
            formatUnits(
              BigNumber(marketBasics?.total_supply_base.toString()!),
              marketConfiguration?.baseTokenDecimals
            )
          )
        )}
      </TableCell>
      <TableCell className="text-lavender font-medium">
        $
        {formatCurrency(
          Number(
            formatUnits(
              BigNumber(marketBasics?.total_borrow_base.toString()!),
              marketConfiguration?.baseTokenDecimals
            )
          )
        )}
      </TableCell>
      <TableCell className="text-lavender font-medium">
        ${formatCurrency(Number(totalCollateralValue))}
      </TableCell>
    </TableRow>
  );
};
