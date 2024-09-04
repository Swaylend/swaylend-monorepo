import { ErrorToast, TransactionSuccessToast } from '@/components/Toasts';
import { Token } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, FAUCET_AMOUNTS } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { hashMessage } from 'fuels';
import { toast } from 'react-toastify';

export const useMintToken = (symbol: string, decimals: number) => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();

  return useMutation({
    mutationKey: ['mintToken', symbol, account, market],
    mutationFn: async () => {
      if (!wallet || !account) return null;

      const tokenFactoryContract = new Token(
        DEPLOYED_MARKETS[market].tokenFactoryAddress,
        wallet
      );

      const amount = new BigNumber(FAUCET_AMOUNTS[symbol]).times(
        10 ** decimals
      );
      const hash = hashMessage(symbol);

      const tx = await tokenFactoryContract.functions
        .mint(
          { Address: { bits: wallet.address.toB256() } },
          hash,
          amount.toString()
        )
        .call();

      const transactionResult = await toast.promise(tx.waitForResult(), {
        pending: {
          render: 'TX is pending...',
        },
      });

      return transactionResult.transactionId;
    },
    onSuccess: (data) => {
      if (data) {
        TransactionSuccessToast({ transactionId: data });
      }
    },
    onError: (error) => {
      ErrorToast({ error: error.message });
    },
  });
};
