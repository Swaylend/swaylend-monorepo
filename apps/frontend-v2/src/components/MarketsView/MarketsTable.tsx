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
import { ASSET_ID_TO_SYMBOL, formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';
import FUEL from '/public/icons/fuel-logo.svg?url';
import SWAY from '/public/tokens/sway.svg?url';
import USDC from '/public/tokens/usdc.svg?url';
import USDT from '/public/tokens/usdt.svg?url';

const SYMBOL_TO_LOGO: Record<string, StaticImport> = {
  USDC: USDC,
  USDT: USDT,
};

const POINTS_LEND: Point[] = [
  {
    id: '1',
    name: 'Fuel',
    description: 'Earn Fuel Points by lending assets',
    icon: FUEL,
  },
  {
    id: '2',
    name: 'SwayLend',
    description: 'Earn SwayLend Points by lending assets',
    icon: SWAY,
  },
  {
    id: '3',
    name: 'SwayLend',
    description: 'Earn SwayLend Points by lending assets',
    icon: USDC,
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
          <TableHead className="w-1/6">Lend Asset</TableHead>
          <TableHead className="w-1/6">Supply Points</TableHead>
          <TableHead className="w-1/12">Utilization</TableHead>
          <TableHead className="w-1/12">Net Earn APR</TableHead>
          <TableHead className="w-1/12">Net Borrow APR</TableHead>
          <TableHead className="w-1/12">Total Earning</TableHead>
          <TableHead className="w-1/12">Total Borrowing</TableHead>
          <TableHead className="w-1/12">Total Collateral</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow onClick={() => console.log('test')}>
          <TableCell>
            <div className="flex gap-x-2 items-center">
              <div>
                <Image
                  src={
                    SYMBOL_TO_LOGO[
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
              <div>
                <div className="text-neutral2 font-medium">
                  {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
                </div>
                <div>USDC</div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <PointIcons points={POINTS_LEND} />
          </TableCell>
          <TableCell>5%</TableCell>
          <TableCell>
            {formatUnits(
              userSupplyBorrow?.supplied ?? BigNumber(0),
              marketConfiguration?.baseTokenDecimals ?? 9
            ).toFormat(2)}{' '}
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
          <TableCell>
            {formatUnits(
              userSupplyBorrow?.supplied ?? BigNumber(0),
              marketConfiguration?.baseTokenDecimals ?? 9
            ).toFormat(2)}{' '}
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
          <TableCell>
            {formatUnits(
              userSupplyBorrow?.supplied ?? BigNumber(0),
              marketConfiguration?.baseTokenDecimals ?? 9
            ).toFormat(2)}{' '}
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
          <TableCell>
            {formatUnits(
              userSupplyBorrow?.supplied ?? BigNumber(0),
              marketConfiguration?.baseTokenDecimals ?? 9
            ).toFormat(2)}{' '}
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
          <TableCell>
            {formatUnits(
              userSupplyBorrow?.supplied ?? BigNumber(0),
              marketConfiguration?.baseTokenDecimals ?? 9
            ).toFormat(2)}{' '}
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
