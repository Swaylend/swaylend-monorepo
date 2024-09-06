import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useBorrowCapacity,
  useMarketConfiguration,
  useUserSupplyBorrow,
} from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import { ASSET_ID_TO_SYMBOL, formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';
import USDC from '/public/tokens/usdc.svg?url';
import USDT from '/public/tokens/usdt.svg?url';

const SYMBOL_TO_LOGO: Record<string, StaticImport> = {
  USDC: USDC,
  USDT: USDT,
};

export const BorrowTable = () => {
  const { account } = useAccount();
  const { changeAction, changeTokenAmount, changeActionTokenAssetId } =
    useMarketStore();

  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: marketConfiguration } = useMarketConfiguration();

  const { data: maxBorrowAmount } = useBorrowCapacity();

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeActionTokenAssetId(marketConfiguration?.baseToken);
  };

  const { balance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-3/12">Borrow Asset</TableHead>
          <TableHead className="w-1/6">Borrow APY</TableHead>
          <TableHead className="w-1/6">Borrowed Assets</TableHead>
          <TableHead className="w-1/6">Borrow Points</TableHead>
          <TableHead className="w-3/12">{}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
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
                <div>
                  {formatUnits(
                    balance ? BigNumber(balance.toString()) : BigNumber(0),
                    marketConfiguration?.baseTokenDecimals ?? 9
                  ).toFixed(2)}{' '}
                  {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
                  {' in wallet'}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>5%</TableCell>
          <TableCell>
            {formatUnits(
              userSupplyBorrow?.borrowed ?? BigNumber(0),
              marketConfiguration?.baseTokenDecimals ?? 9
            ).toFormat(2)}{' '}
            {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
          </TableCell>
          <TableCell>100</TableCell>
          <TableCell>
            <div className="flex gap-x-2 w-full">
              <Button
                disabled={!maxBorrowAmount || maxBorrowAmount.eq(0)}
                className="w-1/2"
                onClick={() => {
                  handleBaseTokenClick(ACTION_TYPE.BORROW);
                }}
              >
                Borrow
              </Button>
              <Button
                disabled={!userSupplyBorrow || userSupplyBorrow.borrowed.eq(0)}
                className="w-1/2"
                onClick={() => {
                  handleBaseTokenClick(ACTION_TYPE.REPAY);
                }}
              >
                Repay
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
