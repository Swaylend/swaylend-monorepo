'use client';
import { useMintToken } from '@/hooks';
import { FAUCET_URL, TOKENS_BY_SYMBOL } from '@/utils';
import { useAccount, useBalance, useIsConnected } from '@fuels/react';
import { BN, toFixed } from 'fuels';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';

export const FaucetView = () => {
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  const { balance: etherBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.ETH.assetId,
  });
  const { balance: usdcBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.USDC.assetId,
  });
  const { balance: btcBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.BTC.assetId,
  });
  const { balance: uniBalance } = useBalance({
    address: account as string,
    assetId: TOKENS_BY_SYMBOL.UNI.assetId,
  });

  const { mutate: mintTokenBTC, isPending: isMintingBTC } = useMintToken(
    'BTC',
    TOKENS_BY_SYMBOL.BTC.decimals
  );

  const { mutate: mintTokenUSDC, isPending: isMintingUSDC } = useMintToken(
    'USDC',
    TOKENS_BY_SYMBOL.USDC.decimals
  );

  const { mutate: mintTokenUNI, isPending: isMintingUNI } = useMintToken(
    'UNI',
    TOKENS_BY_SYMBOL.UNI.decimals
  );

  const isMintingInProgress = useMemo(
    () => isMintingBTC || isMintingUSDC || isMintingUNI,
    [isMintingBTC, isMintingUSDC, isMintingUNI]
  );

  return (
    <div>
      {Object.values(TOKENS_BY_SYMBOL).map((token) => {
        let balance = new BN(0);
        switch (token.symbol) {
          case 'ETH':
            balance = etherBalance ?? new BN(0);
            break;
          case 'BTC':
            balance = btcBalance ?? new BN(0);
            break;
          case 'USDC':
            balance = usdcBalance ?? new BN(0);
            break;
          case 'UNI':
            balance = uniBalance ?? new BN(0);
            break;
          default:
            break;
        }

        return (
          <div key={token.assetId} className="flex gap-x-4">
            <div>{token.name}</div>
            <div>
              {toFixed(balance.formatUnits(token.decimals).toString(), {
                precision: 4,
              })}
              {token.symbol}
            </div>
            <Button
              disabled={
                !isConnected ||
                isMintingInProgress ||
                ((etherBalance ? etherBalance.eq(0) : false) &&
                  token.symbol !== 'ETH')
              }
              onClick={() => {
                switch (token.symbol) {
                  case 'ETH':
                    window.open(`${FAUCET_URL}/?address=${account}`, 'blank');
                    break;
                  case 'BTC':
                    mintTokenBTC();
                    break;
                  case 'USDC':
                    mintTokenUSDC();
                    break;
                  case 'UNI':
                    mintTokenUNI();
                    break;
                  default:
                    break;
                }
              }}
            >
              Mint
            </Button>
          </div>
        );
      })}
    </div>
  );
};
