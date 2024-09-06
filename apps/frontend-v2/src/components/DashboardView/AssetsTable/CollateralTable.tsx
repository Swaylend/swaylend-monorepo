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

export const CollateralTable = () => {
  const { account } = useAccount();
  const {
    changeAction,
    changeTokenAmount,
    changeMode,
    changeActionTokenAssetId,
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
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-3/12">Collateral Asset</TableHead>
          <TableHead className="w-1/6">Wallet Balance</TableHead>
          <TableHead className="w-1/6">Supplied Assets</TableHead>
          <TableHead className="w-1/6">Supply Points</TableHead>
          <TableHead className="w-3/12">{}</TableHead>
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
};
