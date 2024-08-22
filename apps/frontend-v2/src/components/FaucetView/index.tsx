'use client';
import { useMintToken } from '@/hooks';
import { FAUCET_TOKENS, FAUCET_URL } from '@/utils';
import { useAccount, useBalance, useIsConnected } from '@fuels/react';
import { BN, toFixed } from 'fuels';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';

export const FaucetView = () => {
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  const { balance: etherBalance } = useBalance({
    address: account as string,
    assetId: FAUCET_TOKENS.Ethereum.assetId,
  });
  const { balance: usdcBalance } = useBalance({
    address: account as string,
    assetId: FAUCET_TOKENS.USDC.assetId,
  });
  const { balance: btcBalance } = useBalance({
    address: account as string,
    assetId: FAUCET_TOKENS.Bitcoin.assetId,
  });
  const { balance: uniBalance } = useBalance({
    address: account as string,
    assetId: FAUCET_TOKENS.Uniswap.assetId,
  });

  const { mutate: mintTokenBTC, isPending: isMintingBTC } = useMintToken(
    'BTC',
    FAUCET_TOKENS.Bitcoin.decimals
  );

  const { mutate: mintTokenUSDC, isPending: isMintingUSDC } = useMintToken(
    'USDC',
    FAUCET_TOKENS.USDC.decimals
  );

  const { mutate: mintTokenUNI, isPending: isMintingUNI } = useMintToken(
    'UNI',
    FAUCET_TOKENS.Uniswap.decimals
  );

  const isMintingInProgress = useMemo(
    () => isMintingBTC || isMintingUSDC || isMintingUNI,
    [isMintingBTC, isMintingUSDC, isMintingUNI]
  );

  return (
    <div>
      {Object.values(FAUCET_TOKENS).map((token) => {
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
