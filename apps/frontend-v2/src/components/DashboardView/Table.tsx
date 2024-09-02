import {
  useCollateralConfigurations,
  useTotalCollateral,
  useUserCollateralAssets,
} from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import {
  type IToken,
  TOKENS_BY_SYMBOL,
  collaterals,
  formatUnits,
} from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Button } from '../ui/button';
import clsx from 'clsx';

type TableRowProps = {
  account: string | undefined;
  token: IToken;
  protocolBalance: BigNumber;
  protocolBalancePending: boolean;
  handleAssetClick: (action: ACTION_TYPE, assetId: string) => void;
};

const TableRow = ({
  account,
  token,
  protocolBalance,
  protocolBalancePending,
  handleAssetClick,
}: TableRowProps) => {
  const { balance } = useBalance({
    address: account,
    assetId: token.assetId,
  });

  const formattedBalance = formatUnits(
    BigNumber(balance ? balance.toString() : '0'),
    token.decimals
  ).toFormat(6);

  const canSupply = balance?.gt(0);
  const canWithdraw = protocolBalance.gt(0);

  return (
    <div className="flex gap-x-2">
      {token.symbol}
      <div className={clsx(balance === null && 'animate-pulse')}>
        Bal:
        {formattedBalance}
        {token.symbol}
      </div>
      <div className={clsx(protocolBalancePending && 'animate-pulse')}>
        Deposited:{formatUnits(protocolBalance, token.decimals).toFormat(4)}
        {token.symbol}
      </div>
      <Button
        disabled={!canSupply}
        onClick={() =>
          canSupply && handleAssetClick(ACTION_TYPE.SUPPLY, token.assetId)
        }
      >
        +
      </Button>
      <Button
        disabled={!canWithdraw}
        onClick={() =>
          canWithdraw && handleAssetClick(ACTION_TYPE.WITHDRAW, token.assetId)
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
  // const { data: collateralConfigurations } = useCollateralConfigurations();
  // const { data: totalCollateralInfo } = useTotalCollateral();

  const { account } = useAccount();

  const handleAssetClick = (action: ACTION_TYPE, assetId: string) => {
    changeTokenAmount(new BigNumber(0));
    changeAction(action);
    changeMode(0);
    changeActionTokenAssetId(assetId);
  };

  return (
    <div>
      {collaterals.map((token) => (
        <TableRow
          key={token.assetId}
          account={account ?? undefined}
          token={token}
          protocolBalance={
            userCollateralAssets?.[token.assetId] ?? new BigNumber(0)
          }
          protocolBalancePending={userCollateralAssetsPending}
          handleAssetClick={handleAssetClick}
        />
      ))}
    </div>
  );
};
