import { useIsConnected, useWallet, useAccount } from '@fuels/react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import useBalances from '@/hooks/useBalances';
import { BN, hashMessage } from 'fuels';
import {
  CONTRACT_ADDRESSES,
  FAUCET_AMOUNTS,
  FAUCET_TOKENS,
  FAUCET_URL,
} from '@/constants';
import { TokenAbi__factory } from '@/contract-types';
import { toast } from 'react-toastify';

export const FaucetView = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingToken, setMintingToken] = useState<string>('');
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  const { account } = useAccount();

  const { getBalance } = useBalances(FAUCET_TOKENS.map((t) => t.assetId));
  const etherBalance = getBalance(FAUCET_TOKENS[0].assetId);

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
      {FAUCET_TOKENS.map((token) => {
        return (
          <div key={token.assetId} className="flex gap-x-4">
            <div>{token.name}</div>
            <div>
              {getBalance(token.assetId).formatUnits(token.decimals).toString()}{' '}
              {token.symbol}
            </div>
            <Button
              disabled={
                !isConnected ||
                (isMinting && mintingToken !== token.assetId) ||
                (etherBalance.eq(0) && token.symbol !== 'ETH')
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
