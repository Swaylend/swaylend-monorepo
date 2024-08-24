import {
  useCollateralConfigurations,
  useTotalCollateral,
  useUserCollateralAssets,
} from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import { TOKENS_BY_SYMBOL, collaterals, formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Button } from '../ui/button';

export const Table = () => {
  const {
    changeAction,
    changeMode,
    changeTokenAmount,
    changeActionTokenAssetId,
  } = useMarketStore();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: totalCollateralInfo } = useTotalCollateral();
  const { account } = useAccount();
  const { balance: etherBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.ETH.assetId,
  });
  const { balance: btcBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.BTC.assetId,
  });
  const { balance: uniBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.UNI.assetId,
  });

  const handleAssetClick = (action: ACTION_TYPE, assetId: string) => {
    changeTokenAmount(null);
    changeAction(action);
    changeMode(0);
    changeActionTokenAssetId(assetId);
  };

  return (
    <div>
      {collaterals.map((token) => {
        const supplyCap =
          collateralConfigurations == null
            ? BigNumber(0)
            : new BigNumber(
                collateralConfigurations[token.assetId].supply_cap.toString()
              );
        const collateralReserve =
          totalCollateralInfo == null
            ? BigNumber(0)
            : totalCollateralInfo[token.assetId];
        let userBalance = new BigNumber(0);
        switch (token.symbol) {
          case 'ETH':
            userBalance = (etherBalance ?? new BigNumber(0)) as BigNumber;
            break;
          case 'BTC':
            userBalance = (btcBalance ?? new BigNumber(0)) as BigNumber;
            break;
          case 'UNI':
            userBalance = (uniBalance ?? new BigNumber(0)) as BigNumber;
            break;
          default:
            break;
        }
        const protocolBalance =
          userCollateralAssets != null
            ? userCollateralAssets[token.assetId] ?? BigNumber(0)
            : BigNumber(0);
        const canWithdraw = protocolBalance.gt(0);
        const protocolBalanceFormatted = formatUnits(
          protocolBalance,
          token.decimals
        ).toFormat(4);
        const collateralCapacityLeft = supplyCap.minus(collateralReserve);
        const canSupply = userBalance?.gt(0);
        return (
          <div key={token.symbol} className="flex gap-x-2">
            {token.symbol}
            <div>
              Bal:{userBalance.toString()}
              {token.symbol}
            </div>
            <div>
              Deposited:{protocolBalanceFormatted}
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
                canWithdraw &&
                handleAssetClick(ACTION_TYPE.WITHDRAW, token.assetId)
              }
            >
              -
            </Button>
          </div>
        );
      })}
    </div>
  );
};
