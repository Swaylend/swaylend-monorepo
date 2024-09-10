import { AssetName } from '@/components/AssetName';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCollateralConfigurations,
  useMarketConfiguration,
  useUserCollateralAssets,
} from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import { ASSET_ID_TO_SYMBOL, SYMBOL_TO_NAME, formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import React, { useMemo } from 'react';
import BTC from '/public/tokens/bitcoin.svg?url';
import ETH from '/public/tokens/ethereum.svg?url';
import BNB from '/public/tokens/sway.svg?url';
import UNI from '/public/tokens/uni.svg?url';
import USDC from '/public/tokens/usdc.svg?url';
import { useMediaQuery } from 'usehooks-ts';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Title } from '@/components/Title';

const SYMBOL_TO_LOGO: Record<string, StaticImport> = {
  ETH: ETH,
  BTC: BTC,
  BNB: BNB,
  UNI: UNI,
};

type TableRowProps = {
  account: string | undefined;
  assetId: string;
  symbol: string;
  decimals: number;
  protocolBalance: BigNumber;
  protocolBalancePending: boolean;
  handleAssetClick: (action: ACTION_TYPE, assetId: string) => void;
};

const CollateralTableRow = ({
  account,
  assetId,
  symbol,
  decimals,
  protocolBalance,
  protocolBalancePending,
  handleAssetClick,
}: TableRowProps) => {
  const { balance } = useBalance({
    address: account,
    assetId: assetId,
  });

  const formattedBalance = formatUnits(
    BigNumber(balance ? balance.toString() : '0'),
    decimals
  ).toFormat(4);

  const canSupply = balance?.gt(0);
  const canWithdraw = protocolBalance.gt(0);
  return (
    <TableRow>
      <TableCell>
        <AssetName
          symbol={symbol}
          name={SYMBOL_TO_NAME[symbol]}
          src={SYMBOL_TO_LOGO[symbol ?? 'ETH']}
        />
      </TableCell>
      <TableCell>
        {formattedBalance} {symbol}
      </TableCell>
      <TableCell>
        {formatUnits(protocolBalance, decimals).toFixed(4)} {symbol}
      </TableCell>
      <TableCell>100</TableCell>
      <TableCell>
        <div className="flex gap-x-2 w-full">
          <Button
            className="w-1/2"
            disabled={!canSupply}
            onClick={() =>
              canSupply && handleAssetClick(ACTION_TYPE.SUPPLY, assetId)
            }
          >
            Supply
          </Button>
          <Button
            className="w-1/2"
            disabled={!canWithdraw}
            variant={'tertiary'}
            onClick={() =>
              canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
            }
          >
            Withdraw
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const CollateralCard = ({
  account,
  assetId,
  symbol,
  decimals,
  protocolBalance,
  protocolBalancePending,
  handleAssetClick,
}: TableRowProps) => {
  const { balance } = useBalance({
    address: account,
    assetId: assetId,
  });

  const formattedBalance = formatUnits(
    BigNumber(balance ? balance.toString() : '0'),
    decimals
  ).toFormat(4);

  const canSupply = balance?.gt(0);
  const canWithdraw = protocolBalance.gt(0);
  return (
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
          ><div className='w-1/2 text-neutral4 font-medium'>Collateral Asset</div>
            <AssetName
              symbol={symbol}
              name={SYMBOL_TO_NAME[symbol]}
              src={SYMBOL_TO_LOGO[symbol ?? 'ETH']}
            />
          </div>
          <div className='w-full flex items-center'
          ><div className='w-1/2 text-neutral4 font-medium'>Wallet Balance</div>
            <div className='text-neutral5'>{formattedBalance} {symbol}</div>
          </div>
          <div className='w-full flex items-center'
          ><div className='w-1/2 text-neutral4 font-medium'>Supplied Assets</div>
            <div> {formatUnits(protocolBalance, decimals).toFixed(4)} {symbol}</div>
          </div>
          <div className='w-full flex items-center'
          ><div className='w-1/2 text-neutral4 font-medium'>Supply Points</div>
            100
          </div>

        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-x-2 w-full">
          <Button
            className="w-1/2"
            disabled={!canSupply}
            onClick={() =>
              canSupply && handleAssetClick(ACTION_TYPE.SUPPLY, assetId)
            }
          >
            Supply
          </Button>
          <Button
            className="w-1/2"
            disabled={!canWithdraw}
            variant={'tertiary'}
            onClick={() =>
              canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
            }
          >
            Withdraw
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};



export const CollateralTable = () => {
  const { account } = useAccount();
  const {
    changeAction,
    changeTokenAmount,
    changeMode,
    changeActionTokenAssetId,
    changeInputDialogOpen,
  } = useMarketStore();

  const { data: userCollateralAssets, isLoading: userCollateralAssetsLoading } =
    useUserCollateralAssets();

  const {
    data: collateralConfigurations,
    isPending: collateralConfigurationsPending,
    error: collateralConfigurationsError,
  } = useCollateralConfigurations();

  const collaterals = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations);
  }, [collateralConfigurations]);

  const handleAssetClick = (action: ACTION_TYPE, assetId: string) => {
    changeTokenAmount(new BigNumber(0));
    changeAction(action);
    changeMode(0);
    changeActionTokenAssetId(assetId);
    changeInputDialogOpen(true);
  };

  const mobile = useMediaQuery('(max-width:640px)');

  if (!mobile) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/12">Collateral Asset</TableHead>
            <TableHead className="w-1/6">Wallet Balance</TableHead>
            <TableHead className="w-1/6">Supplied Assets</TableHead>
            <TableHead className="w-1/6">Supply Points</TableHead>
            <TableHead className="w-3/12">{ }</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaterals.map((collateral) => (
            <CollateralTableRow
              key={collateral.asset_id}
              account={account ?? undefined}
              assetId={collateral.asset_id}
              symbol={ASSET_ID_TO_SYMBOL[collateral.asset_id]}
              decimals={collateral.decimals}
              protocolBalance={
                userCollateralAssets?.[collateral.asset_id] ?? new BigNumber(0)
              }
              protocolBalancePending={userCollateralAssetsLoading}
              handleAssetClick={handleAssetClick}
            />
          ))}
        </TableBody>
      </Table>
    );
  }
  return (
    <div className='flex flex-col gap-y-4 px-4'>
      <Title>
        Collateral Assets
      </Title>
      <div className='flex flex-col gap-y-4'>
        {
          collaterals.map((collateral) => (

            <CollateralCard
              key={collateral.asset_id}
              account={account ?? undefined}
              assetId={collateral.asset_id}
              symbol={ASSET_ID_TO_SYMBOL[collateral.asset_id]}
              decimals={collateral.decimals}
              protocolBalance={
                userCollateralAssets?.[collateral.asset_id] ?? new BigNumber(0)
              }
              protocolBalancePending={userCollateralAssetsLoading}
              handleAssetClick={handleAssetClick}
            />
          )
          )
        }
      </div>
    </div>
  )
};
