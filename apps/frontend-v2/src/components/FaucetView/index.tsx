'use client';
import { useCollateralConfigurations, useMintToken } from '@/hooks';
import { useMarketConfiguration } from '@/hooks/useMarketConfiguration';
import {
  ASSET_ID_TO_SYMBOL,
  FAUCET_URL,
  FUEL_ETH_BASE_ASSET_ID,
} from '@/utils';
import { useAccount, useBalance, useIsConnected } from '@fuels/react';
import { BN, toFixed } from 'fuels';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import { useIsMutating } from '@tanstack/react-query';

type FaucetRowProps = {
  account: string | undefined;
  assetId: string;
  symbol: string;
  decimals: number;
  mintPending: boolean;
  ethBalance: BN;
};

const FaucetRow = ({
  account,
  assetId,
  symbol,
  decimals,
  mintPending,
  ethBalance,
}: FaucetRowProps) => {
  const { balance } = useBalance({
    address: account,
    assetId: assetId,
  });

  const { mutate: mint, isPending: isMinting } = useMintToken(symbol, decimals);

  if (!balance) return <div>Loading...</div>;

  return (
    <div key={assetId} className="flex gap-x-4">
      <div>
        {toFixed(balance.formatUnits(decimals).toString(), {
          precision: 4,
        })}
        {symbol}
      </div>
      <Button
        disabled={
          !account || mintPending || (symbol !== 'ETH' && ethBalance.eq(0))
        }
        onMouseDown={() => {
          if (symbol === 'ETH') {
            window.open(`${FAUCET_URL}/?address=${account}`, 'blank');
            return;
          }
          mint();
        }}
      >
        Mint
      </Button>
    </div>
  );
};

export const FaucetView = () => {
  const { account } = useAccount();

  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration();

  const {
    data: collateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations();

  const { balance: ethBalance } = useBalance({
    address: account ?? undefined,
    assetId: FUEL_ETH_BASE_ASSET_ID,
  });

  const assets = useMemo(() => {
    if (!marketConfiguration || !collateralConfigurations) return [];

    return [
      ...Object.values(collateralConfigurations).map(
        (collateralConfiguration) => {
          return {
            assetId: collateralConfiguration.asset_id,
            symbol: ASSET_ID_TO_SYMBOL[collateralConfiguration.asset_id],
            decimals: marketConfiguration.baseTokenDecimals,
          };
        }
      ),
      {
        assetId: marketConfiguration.baseToken,
        symbol: ASSET_ID_TO_SYMBOL[marketConfiguration.baseToken],
        decimals: marketConfiguration.baseTokenDecimals,
      },
    ];
  }, [marketConfiguration, collateralConfigurations]);

  const numberOfMintsPending = useIsMutating({ mutationKey: ['mintToken'] });

  if (isPendingMarketConfiguration || isPendingCollateralConfigurations) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {assets.map((asset) => (
        <FaucetRow
          key={asset.assetId}
          assetId={asset.assetId}
          symbol={asset.symbol}
          decimals={asset.decimals}
          account={account ?? undefined}
          mintPending={numberOfMintsPending > 0}
          ethBalance={ethBalance ?? new BN(0)}
        />
      ))}
    </div>
  );
};
