'use client';

import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useMemo } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

import { appConfig } from '@/configs';
import {
  useApr,
  useCollateralConfigurations,
  useMarketBasics,
  useMarketConfiguration,
  usePrice,
  useTotalCollateral,
  useUtilization,
} from '@/hooks/v1';
import { cn } from '@/lib/utils';
import {
  formatUnits,
  getFormattedPrice,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
} from '@/utils';
import SWAY from '/public/tokens/sway.svg?url';
import { Skeleton } from '../../ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { CircularProgressBar } from '../circular-progress-bar';
import { type Collateral, CollateralIcons } from '../collateral-icons';
import { NetBorrowTooltip } from '../net-borrow-tooltip';
import { NetEarnTooltip } from '../net-earn-tooltip';

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
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-[40px] w-full rounded-md bg-primary/20" />
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
  const { data: aprData, isPending: isAprPending } = useApr(marketName);

  const {
    data: collateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations(marketName);

  const collateralIcons: Collateral[] = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations).map((collateral) => ({
      id: appConfig.client.shared.assets[collateral.asset_id.bits],
      name: appConfig.client.shared.assets[collateral.asset_id.bits],
      description: '',
      icon:
        SYMBOL_TO_ICON[
          appConfig.client.shared.assets[collateral.asset_id.bits]
        ] || SWAY,
    }));
  }, [collateralConfigurations]);

  const { data: marketBasics } = useMarketBasics(marketName);

  const { data: totalCollateral } = useTotalCollateral(marketName);

  const { data: priceData } = usePrice(marketName);

  const totalCollateralValue = useMemo(() => {
    if (!(priceData && totalCollateral && collateralConfigurations)) {
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

  return isPendingCollateralConfigurations || isAprPending ? (
    SkeletonRow
  ) : (
    <TableRow
      className="cursor-pointer transition-colors duration-200 hover:bg-white/5"
      onClick={() => router.push(`/markets/v1/fuel-${marketName}`)}
    >
      <TableCell>
        <div className="flex items-center gap-x-2">
          <div>
            <Image
              alt={marketName}
              className={'min-h-[32px] min-w-[32px] rounded-full'}
              height={32}
              src={SYMBOL_TO_ICON[marketName]}
              width={32}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-x-2">
              <div className="font-semibold text-md text-white">
                {SYMBOL_TO_NAME[marketName]}
              </div>
              <div className="font-semibold text-moon text-sm">
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
        <div className="h-[48px] w-[48px]">
          {
            <CircularProgressBar
              percent={formatUnits(BigNumber(utilization?.toString() ?? 0), 18)}
            />
          }
        </div>
      </TableCell>
      <TableCell
        className={cn(
          isAprPending && 'animate-pulse',
          'font-medium text-lavender'
        )}
      >
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger
              onClick={(e: { preventDefault: () => any }) => e.preventDefault()}
            >
              <div>{aprData?.netSupplyApr.times(100).toFixed(2)}%</div>
            </TooltipTrigger>
            <TooltipContent
              onPointerDownOutside={(e: { preventDefault: () => any }) =>
                e.preventDefault()
              }
            >
              <NetEarnTooltip aprData={aprData} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell
        className={cn(
          isAprPending && 'animate-pulse',
          'font-medium text-lavender'
        )}
      >
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger
              onClick={(e: { preventDefault: () => any }) => e.preventDefault()}
            >
              <div>{aprData?.netBorrowApr.times(100).toFixed(2)}%</div>
            </TooltipTrigger>
            <TooltipContent
              onPointerDownOutside={(e: { preventDefault: () => any }) =>
                e.preventDefault()
              }
            >
              <NetBorrowTooltip aprData={aprData} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {getFormattedPrice(
          formatUnits(
            BigNumber(marketBasics?.total_supply_base.toString() ?? 0),
            marketConfiguration?.baseTokenDecimals
          )
        )}
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {getFormattedPrice(
          formatUnits(
            BigNumber(marketBasics?.total_borrow_base.toString() ?? 0),
            marketConfiguration?.baseTokenDecimals
          )
        )}
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {getFormattedPrice(totalCollateralValue)}
      </TableCell>
    </TableRow>
  );
};
