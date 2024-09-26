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
  SYMBOL_TO_NAME,
  formatUnits,
  getBorrowApr,
  getFormattedPrice,
  getSupplyApr,
} from '@/utils';
import BigNumber from 'bignumber.js';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import type React from 'react';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import ETHEREUM from '/public/tokens/ethereum.svg?url';
import SWAY from '/public/tokens/sway.svg?url';
import USDC from '/public/tokens/usdc.svg?url';
import USDT from '/public/tokens/usdt.svg?url';
import { CircularProgressBar } from '../CircularProgressBar';
import { type Point, PointIcons } from '../PointIcons';
import { Skeleton } from '../ui/skeleton';

const SYMBOL_TO_LOGO: Record<string, StaticImport> = {
  USDC: USDC,
  USDT: USDT,
  ETH: ETHEREUM,
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

  const collateralIcons: Point[] = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations).map((collateral) => ({
      id: ASSET_ID_TO_SYMBOL[collateral.asset_id.bits],
      name: ASSET_ID_TO_SYMBOL[collateral.asset_id.bits],
      description: '',
      icon:
        SYMBOL_TO_LOGO[ASSET_ID_TO_SYMBOL[collateral.asset_id.bits]] || SWAY,
    }));
  }, [collateralConfigurations]);

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
      onClick={() => router.push(`/market/fuel-${marketName}`)}
      className="cursor-pointer hover:bg-white/5 transition-colors duration-200"
    >
      <TableCell>
        <div className="flex gap-x-2 items-center">
          <div>
            <Image
              src={SYMBOL_TO_LOGO[marketName]}
              alt={marketName}
              width={32}
              height={32}
              className={'rounded-full'}
            />
          </div>
          <div>
            <div className="flex gap-x-2 items-baseline">
              <div className="text-white text-lg font-semibold">
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
        <PointIcons points={collateralIcons} />
      </TableCell>
      <TableCell>
        <div className="w-[48px] h-[48px]">
          {
            <CircularProgressBar
              percent={BigNumber(utilization?.toString() ?? 0)
                .div(BigNumber(10).pow(18))
                .div(100)}
            />
          }
        </div>
      </TableCell>
      <TableCell>
        <div className="w-[48px] h-[48px]">
          {
            <CircularProgressBar
              percent={BigNumber(supplyApr.slice(0, -1)).div(100)}
            />
          }
        </div>
      </TableCell>
      <TableCell>
        <div className="w-[48px] h-[48px]">
          {
            <CircularProgressBar
              percent={BigNumber(borrowApr.slice(0, -1)).div(100)}
            />
          }
        </div>
      </TableCell>
      <TableCell>
        {getFormattedPrice(
          formatUnits(
            BigNumber(marketBasics?.total_supply_base.toString()!),
            marketConfiguration?.baseTokenDecimals
          )
        )}
      </TableCell>
      <TableCell>
        {getFormattedPrice(
          formatUnits(
            BigNumber(marketBasics?.total_borrow_base.toString()!),
            marketConfiguration?.baseTokenDecimals
          )
        )}
      </TableCell>
      <TableCell>{getFormattedPrice(totalCollateralValue)}</TableCell>
    </TableRow>
  );
};
