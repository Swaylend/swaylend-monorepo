'use client';
import {
  CONTRACT_ADDRESSES,
  FAUCET_AMOUNTS,
  FAUCET_TOKENS,
  FAUCET_URL,
} from '@/utils';
import { TokenAbi__factory } from '@/contract-types';
import {
  useAccount,
  useBalance,
  useIsConnected,
  useWallet,
} from '@fuels/react';
import { BN, hashMessage, toFixed } from 'fuels';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';

export const FaucetView = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingToken, setMintingToken] = useState<string>('');
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
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

  console.log(etherBalance);
  const mint = async (assetId: string, decimals: any, symbol: string) => {
    if (!wallet || !isConnected) return;
    setIsMinting(true);
    setMintingToken(assetId);
    const amount = new BN(FAUCET_AMOUNTS[symbol]).mul(10 ** decimals);
    console.log(amount.toString());
    try {
      const tokenFactoryContract = TokenAbi__factory.connect(
        CONTRACT_ADDRESSES.tokenFactory,
        wallet
      );
      const hash = hashMessage(symbol);
      const tx = (await tokenFactoryContract.functions
        .mint(
          { Address: { bits: wallet.address.toB256() } },
          hash,
          amount.toString()
        )
        .call()) as any;

      const transactionResult = (await toast.promise(tx.waitForResult(), {
        pending: {
          render: <div>TX is pending...</div>,
        },
      })) as any;

      if (transactionResult != null) {
        const txId = transactionResult.id ?? '';
        toast('Done');
        // Force update balances
      } else {
        toast('Error');
      }
    } catch (e) {
      console.log('error');
      toast('Error');
      setIsMinting(false);
      setMintingToken('');
    }

    setIsMinting(false);
    setMintingToken('');
  };

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
                (isMinting && mintingToken !== token.assetId) ||
                ((etherBalance ?? new BN(0)).eq(0) && token.symbol !== 'ETH')
              }
              onClick={() => {
                if (token.symbol === 'ETH') {
                  window.open(`${FAUCET_URL}/?address=${account}`, 'blank');
                } else {
                  mint(token.assetId, token.decimals, token.symbol);
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
