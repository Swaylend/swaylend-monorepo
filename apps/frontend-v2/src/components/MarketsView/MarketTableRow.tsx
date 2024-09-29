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
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
  getBorrowApr,
  getFormattedPrice,
  getSupplyApr,
} from '@/utils';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import type React from 'react';

import { appConfig } from '@/configs';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import SWAY from '/public/tokens/sway.svg?url';
import { CircularProgressBar } from '../CircularProgressBar';
import { type Collateral, CollateralIcons } from '../CollateralIcons';
import { Skeleton } from '../ui/skeleton';

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

  const { data: utilization } = useUtilization(marketName);
  const { data: borrowRate } = useBorrowRate(marketName);
  const { data: supplyRate } = useSupplyRate(marketName);
  const borrowApr = useMemo(() => getBorrowApr(borrowRate), [borrowRate]);
  const supplyApr = useMemo(() => getSupplyApr(supplyRate), [supplyRate]);

  const {
    data: collateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations(marketName);

  const collateralIcons: Collateral[] = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations).map((collateral) => ({
      id: appConfig.assets[collateral.asset_id.bits],
      name: appConfig.assets[collateral.asset_id.bits],
      description: '',
      icon: SYMBOL_TO_ICON[appConfig.assets[collateral.asset_id.bits]] || SWAY,
    }));
  }, [collateralConfigurations]);

  const { data: marketBasics } = useMarketBasics(marketName);

  const { data: totalCollateral } = useTotalCollateral(marketName);

  const { data: priceData } = usePrice(marketName);

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
      onClick={() => router.push(`/market/fuel-${marketName}`)}
      className="cursor-pointer hover:bg-white/5 transition-colors duration-200"
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
              percent={formatUnits(BigNumber(utilization?.toString() ?? 0), 18)}
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
        {getFormattedPrice(
          formatUnits(
            BigNumber(marketBasics?.total_supply_base.toString() ?? 0),
            marketConfiguration?.baseTokenDecimals
          )
        )}
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {getFormattedPrice(
          formatUnits(
            BigNumber(marketBasics?.total_borrow_base.toString() ?? 0),
            marketConfiguration?.baseTokenDecimals
          )
        )}
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {getFormattedPrice(totalCollateralValue)}
      </TableCell>
    </TableRow>
  );
};
