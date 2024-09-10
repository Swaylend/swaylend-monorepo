import { Title } from '@/components/Title';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';
import { useMediaQuery } from 'usehooks-ts';
import USDC from '/public/tokens/usdc.svg?url';
import USDT from '/public/tokens/usdt.svg?url';

const SYMBOL_TO_LOGO: Record<string, StaticImport> = {
  USDC: USDC,
  USDT: USDT,
};

export const BorrowTable = () => {
  const { account } = useAccount();
  const {
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
    changeInputDialogOpen,
  } = useMarketStore();

  const { data: userSupplyBorrow } = useUserSupplyBorrow();

  const { data: marketConfiguration } = useMarketConfiguration();

  const { data: maxBorrowAmount } = useBorrowCapacity();

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

  const mobile = useMediaQuery('(max-width:640px)');

  if (!mobile) {
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
                    alt={
                      ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']
                    }
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
                  disabled={
                    !userSupplyBorrow || userSupplyBorrow.borrowed.eq(0)
                  }
                  className="w-1/2"
                  variant={'tertiary'}
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
  }

  return (
    <div className="flex flex-col gap-y-4 px-4">
      <Title>Borrow Assets</Title>
      <Card>
        <VisuallyHidden.Root asChild>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
        </VisuallyHidden.Root>
        <CardContent>
          <div className="flex flex-col gap-y-4 pt-8 px-4">
            <div className="w-full flex items-center">
              <div className="w-1/2 text-neutral4 font-medium">
                Borrow Asset
              </div>
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
                    alt={
                      ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']
                    }
                    width={32}
                    height={32}
                    className={'rounded-full'}
                  />
                </div>
                <div>
                  <div className="text-neutral2 font-medium">
                    {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
                  </div>
                  <div className="text-neutral5 text-sm">
                    {formatUnits(
                      balance ? BigNumber(balance.toString()) : BigNumber(0),
                      marketConfiguration?.baseTokenDecimals ?? 9
                    ).toFixed(2)}
                    {' in wallet'}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex items-center">
              <div className="w-1/2 text-neutral4 font-medium">Borrow APY</div>
              <div className="text-neutral5">5%</div>
            </div>
            <div className="w-full flex items-center">
              <div className="w-1/2 text-neutral4 font-medium">
                Borrowed Assets
              </div>
              <div>
                {formatUnits(
                  userSupplyBorrow?.borrowed ?? BigNumber(0),
                  marketConfiguration?.baseTokenDecimals ?? 9
                ).toFormat(2)}{' '}
                {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
              </div>
            </div>
            <div className="w-full flex items-center">
              <div className="w-1/2 text-neutral4 font-medium">
                Borrow Points
              </div>
              100
            </div>
          </div>
        </CardContent>
        <CardFooter>
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
              variant={'tertiary'}
              onClick={() => {
                handleBaseTokenClick(ACTION_TYPE.REPAY);
              }}
            >
              Repay
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
