import { type Point, PointIcons } from '@/components/PointIcons';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMarketConfiguration, useUserSupplyBorrow } from '@/hooks';
import { type ACTION_TYPE, useMarketStore } from '@/stores';
import {
  ASSET_ID_TO_SYMBOL,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
} from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';
import { type Collateral, CollateralIcons } from '../CollateralIcons';

const USDC_COLLATERALS: Collateral[] = [
  {
    id: '1',
    name: 'Ethereum',
    icon: SYMBOL_TO_ICON.ETH,
  },
  {
    id: '2',
    name: 'Bitcoin',
    icon: SYMBOL_TO_ICON.BTC,
  },
  {
    id: '3',
    name: 'Uniswap',
    icon: SYMBOL_TO_ICON.UNI,
  },
];

export const MarketsTable = () => {
  const { account } = useAccount();
  const {
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
    changeInputDialogOpen,
  } = useMarketStore();

  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: marketConfiguration } = useMarketConfiguration();

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8} className="">
            <div className="w-full flex justify-center text-white font-semibold">
              Fuel Network
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Market
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Collateral Assets
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Utilization
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Net Earn APR
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Net Borrow APR
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Total Earning
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Total Borrowing
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Total Collateral
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow onClick={() => console.log('test')}>
          <TableCell>
            <div className="flex gap-x-2 items-center">
              <div>
                <Image
                  src={
                    SYMBOL_TO_ICON[
                      ASSET_ID_TO_SYMBOL[
                        marketConfiguration?.baseToken ?? ''
                      ] ?? 'USDC'
                    ]
                  }
                  alt={ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
                  width={32}
                  height={32}
                  className={'rounded-full'}
                />
              </div>
              <div className="flex gap-x-2 items-baseline">
                <div className="text-white text-lg font-semibold">
                  {
                    SYMBOL_TO_NAME[
                      ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']
                    ]
                  }
                </div>
                <div className="text-sm font-semibold text-moon">
                  {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <CollateralIcons collaterals={USDC_COLLATERALS} />
          </TableCell>
          <TableCell>
            <div className="text-white text-md font-medium">5%</div>
          </TableCell>
          <TableCell>
            <div className="text-white text-md font-medium">5%</div>
          </TableCell>
          <TableCell>
            <div className="text-white text-md font-medium">5%</div>
          </TableCell>
          <TableCell>
            <div className="text-white text-md font-medium">$5</div>
          </TableCell>
          <TableCell>
            <div className="text-white text-md font-medium">$5</div>
          </TableCell>
          <TableCell>
            <div className="text-white text-md font-medium">$230</div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
