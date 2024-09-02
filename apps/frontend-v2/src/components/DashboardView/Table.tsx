import {
  useCollateralConfigurations,
  useTotalCollateral,
  useUserCollateralAssets,
} from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import { type IToken, formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import clsx from 'clsx';

type TableRowProps = {
  account: string | undefined;
  assetId: string;
  symbol: string;
  decimals: number;
  protocolBalance: BigNumber;
  protocolBalancePending: boolean;
  handleAssetClick: (action: ACTION_TYPE, assetId: string) => void;
};

const TableRow = ({
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
  ).toFormat(6);

  const canSupply = balance?.gt(0);
  const canWithdraw = protocolBalance.gt(0);

  return (
    <div className="flex gap-x-2">
      {symbol}
      <div className={clsx(balance === null && 'animate-pulse')}>
        Bal:
        {formattedBalance}
        {symbol}
      </div>
      <div className={clsx(protocolBalancePending && 'animate-pulse')}>
        Deposited:{formatUnits(protocolBalance, decimals).toFormat(4)}
        {symbol}
      </div>
      <Button
        disabled={!canSupply}
        onClick={() =>
          canSupply && handleAssetClick(ACTION_TYPE.SUPPLY, assetId)
        }
      >
        +
      </Button>
      <Button
        disabled={!canWithdraw}
        onClick={() =>
          canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, assetId)
        }
      >
        -
      </Button>
    </div>
  );
};

export const Table = () => {
  const {
    changeAction,
    changeMode,
    changeTokenAmount,
    changeActionTokenAssetId,
  } = useMarketStore();
  const { data: userCollateralAssets, isPending: userCollateralAssetsPending } =
    useUserCollateralAssets();
  const {
    data: collateralConfigurations,
    isPending: collateralConfigurationsPending,
    error: collateralConfigurationsError,
  } = useCollateralConfigurations();
  // const { data: totalCollateralInfo } = useTotalCollateral();

  const { account } = useAccount();

  const handleAssetClick = (action: ACTION_TYPE, assetId: string) => {
    changeTokenAmount(new BigNumber(0));
    changeAction(action);
    changeMode(0);
    changeActionTokenAssetId(assetId);
  };

  const collaterals = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations);
  }, [collateralConfigurations]);

  if (collateralConfigurationsPending) {
    return <div>Loading...</div>;
  }

  if (!collateralConfigurations || collateralConfigurationsError) {
    return <div>Failed to load collateral configurations</div>;
  }

  return (
    <div>
      {collaterals.map((collateral) => (
        <TableRow
          key={collateral.asset_id}
          account={account ?? undefined}
          assetId={collateral.asset_id}
          symbol={'TODO'}
          decimals={collateral.decimals}
          protocolBalance={
            userCollateralAssets?.[collateral.asset_id] ?? new BigNumber(0)
          }
          protocolBalancePending={userCollateralAssetsPending}
          handleAssetClick={handleAssetClick}
        />
      ))}
    </div>
  );
};
