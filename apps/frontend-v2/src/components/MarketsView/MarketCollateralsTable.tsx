import { AssetName } from '@/components/AssetName';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollateralConfigurations, useUserCollateralAssets } from '@/hooks';
import { type ACTION_TYPE, useMarketStore } from '@/stores';
import {
  ASSET_ID_TO_SYMBOL,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
} from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

type TableRowProps = {
  account: string | undefined;
  assetId: string;
  symbol: string;
  decimals: number;
  protocolBalance: BigNumber;
  protocolBalancePending: boolean;
  handleAssetClick: (action: ACTION_TYPE, assetId: string) => void;
};

const MarketCollateralsTableRow = ({
  account,
  assetId,
  symbol,
  decimals,
  protocolBalance,
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
          src={SYMBOL_TO_ICON[symbol]}
        />
      </TableCell>
      <TableCell>
        {formattedBalance} {symbol}
      </TableCell>
      <TableCell>
        {formatUnits(protocolBalance, decimals).toFixed(4)} {symbol}
      </TableCell>
      <TableCell>100</TableCell>
      <TableCell>80%</TableCell>
      <TableCell>85%</TableCell>
      <TableCell>5%</TableCell>
    </TableRow>
  );
};

export const MarketCollateralsTable = () => {
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

  const { data: collateralConfigurations } = useCollateralConfigurations();

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

  return (
    <Table className="max-sm:hidden mt-8">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Collateral Asset</TableHead>
          <TableHead className="w-1/8">Total Supply</TableHead>
          <TableHead className="w-1/8">Reserves</TableHead>
          <TableHead className="w-1/8">Oracle Price</TableHead>
          <TableHead className="w-1/8">Collateral Factor</TableHead>
          <TableHead className="w-1/8">Liquidation Factor</TableHead>
          <TableHead className="w-1/8">Liquidation Penalty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collaterals.map((collateral) => (
          <MarketCollateralsTableRow
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
