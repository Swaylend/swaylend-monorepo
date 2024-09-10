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
import { ACTION_TYPE, useMarketStore } from '@/stores';
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
import { useMediaQuery } from 'usehooks-ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Title } from '@/components/Title';

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

export const LendTable = () => {
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

  const mobile = useMediaQuery('(max-width:640px)');

  if (!mobile) {


    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/12">Lend Asset</TableHead>
            <TableHead className="w-1/6">Lend APY</TableHead>
            <TableHead className="w-1/6">Supplied Assets</TableHead>
            <TableHead className="w-1/6">Supply Points</TableHead>
            <TableHead className="w-3/12">{ }</TableHead>
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
                userSupplyBorrow?.supplied ?? BigNumber(0),
                marketConfiguration?.baseTokenDecimals ?? 9
              ).toFormat(2)}{' '}
              {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}
            </TableCell>
            <TableCell>
              <PointIcons points={POINTS_LEND} />
            </TableCell>
            <TableCell>
              <div className="flex gap-x-2 w-full">
                <Button
                  className="w-1/2"
                  onClick={() => {
                    handleBaseTokenClick(ACTION_TYPE.SUPPLY);
                  }}
                >
                  Supply
                </Button>
                <Button
                  className="w-1/2"
                  variant={'tertiary'}
                  onClick={() => {
                    handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
                  }}
                >
                  Withdraw
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
  return (
    <div className='flex flex-col gap-y-4 px-4'>
      <Title>
        Lend Assets
      </Title>
      <Card>
        <VisuallyHidden.Root asChild>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
        </VisuallyHidden.Root>
        <CardContent>
          <div className='flex flex-col gap-y-4 pt-8 px-4'>
            <div className='w-full flex items-center'
            ><div className='w-1/2 text-neutral4 font-medium'>Lend Asset</div>
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
                  <div className='text-neutral5 text-sm'>
                    {formatUnits(
                      balance ? BigNumber(balance.toString()) : BigNumber(0),
                      marketConfiguration?.baseTokenDecimals ?? 9
                    ).toFixed(2)}
                    {' in wallet'}
                  </div>
                </div>
              </div>
            </div>
            <div className='w-full flex items-center'
            ><div className='w-1/2 text-neutral4 font-medium'>Lend APY</div>
              <div className='text-neutral5'>5%</div>
            </div>
            <div className='w-full flex items-center'
            ><div className='w-1/2 text-neutral4 font-medium'>Supplied Assets</div>
              <div>{formatUnits(
                userSupplyBorrow?.supplied ?? BigNumber(0),
                marketConfiguration?.baseTokenDecimals ?? 9
              ).toFormat(2)}{' '}
                {ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken ?? '']}</div>
            </div>
            <div className='w-full flex items-center'
            ><div className='w-1/2 text-neutral4 font-medium'>Supply Points</div>
              <PointIcons points={POINTS_LEND} />
            </div>

          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-x-2 w-full">
            <Button
              className="w-1/2"
              onClick={() => {
                handleBaseTokenClick(ACTION_TYPE.SUPPLY);
              }}
            >
              Supply
            </Button>
            <Button
              className="w-1/2"
              variant={'tertiary'}
              onClick={() => {
                handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
              }}
            >
              Withdraw
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
};
