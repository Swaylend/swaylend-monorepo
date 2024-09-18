'use client';
import {
  useBalance,
  useCollateralConfigurations,
  useMarketConfiguration,
  useMintToken,
} from '@/hooks';
import {
  ASSET_ID_TO_SYMBOL,
  FAUCET_URL,
  FUEL_ETH_BASE_ASSET_ID,
  formatUnits,
} from '@/utils';
import { useAccount } from '@fuels/react';
import { useIsMutating } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { BN, toFixed } from 'fuels';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
  const { data: balance } = useBalance({
    address: account,
    assetId: assetId,
  });

  const { mutate: mint } = useMintToken(symbol, decimals);

  return (
    <TableRow key={assetId}>
      <TableCell>
        {toFixed(
          formatUnits(
            BigNumber(balance ? balance.toString() : '0'),
            decimals
          ).toString(),
          {
            precision: 4,
          }
        )}
        {` ${symbol}`}
      </TableCell>
      <TableCell>
        <Button
          disabled={
            !account || mintPending || (symbol !== 'ETH' && ethBalance.eq(0))
          }
          onMouseDown={() => {
            if (symbol === 'ETH') {
              window.open(`${FAUCET_URL}/?address=${account}`, 'blank');
              return null;
            }
            mint();
          }}
        >
          Mint
        </Button>
      </TableCell>
    </TableRow>
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

  const { data: ethBalance } = useBalance({
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
            decimals:
              collateralConfigurations[collateralConfiguration.asset_id]
                .decimals,
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
    <div className="h-full w-full flex flex-1 items-center justify-center flex-col gap-y-4 px-2 sm:px-16">
      <div className="max-w-[640px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8/12">Current balance</TableHead>
              <TableHead className="w-4/12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
