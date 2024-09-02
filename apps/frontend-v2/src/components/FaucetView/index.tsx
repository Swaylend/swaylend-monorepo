'use client';
import { useCollateralConfigurations, useMintToken } from '@/hooks';
import { FAUCET_URL } from '@/utils';
import { useAccount, useBalance, useIsConnected } from '@fuels/react';
import { BN, toFixed } from 'fuels';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import { useMarketConfiguration } from '@/hooks/useMarketConfiguration';

type FaucetRowProps = {
  account: string | undefined;
  assetId: string;
  symbol: string;
  decimals: number;
};

const FaucetRow = ({ account, assetId, symbol, decimals }: FaucetRowProps) => {
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
          // !isConnected ||
          // isMintingInProgress ||
          // ((etherBalance ? etherBalance.eq(0) : false) &&
          //   token.symbol !== 'ETH')
          false
        }
        onMouseDown={() => mint()}
      >
        Mint
      </Button>
    </div>
  );
};

export const FaucetView = () => {
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  const { data: marketConfiguration, isPending: isPendingMarketConfiguration } =
    useMarketConfiguration();

  const {
    data: collateralConfigurations,
    isPending: isPendingCollateralConfigurations,
  } = useCollateralConfigurations();

  // TODO: Add this back
  // const isMintingInProgress = useMemo(
  //   () => isMintingBTC || isMintingUSDC || isMintingUNI,
  //   [isMintingBTC, isMintingUSDC, isMintingUNI]
  // );

  if (isPendingMarketConfiguration || isPendingCollateralConfigurations)
    return <div>Loading...</div>;

  const assets = useMemo(() => {
    if (!marketConfiguration || !collateralConfigurations) return [];

    return Object.values(collateralConfigurations).map(
      (collateralConfiguration) => {
        return {
          assetId: collateralConfiguration.asset_id,
          symbol: 'TODO',
          decimals: marketConfiguration.baseTokenDecimals,
        };
      }
    );
  }, [marketConfiguration, collateralConfigurations]);

  return (
    <div>
      {assets.map((asset) => (
        <FaucetRow
          key={asset.assetId}
          assetId={asset.assetId}
          symbol={asset.symbol}
          decimals={asset.decimals}
          account={account ?? undefined}
        />
      ))}
    </div>
  );
};
