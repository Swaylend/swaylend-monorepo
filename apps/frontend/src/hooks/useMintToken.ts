import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { appConfig } from '@/configs';
import { Token } from '@/contract-types';
import { selectMarket, useMarketStore } from '@/stores';
import { FAUCET_AMOUNTS } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { hashMessage } from 'fuels';
import { toast } from 'react-toastify';

export const useMintToken = (symbol: string, decimals: number) => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const market = useMarketStore(selectMarket);

  return useMutation({
    mutationKey: ['mintToken', symbol, account, market],
    mutationFn: async () => {
      if (!wallet || !account) return null;

      const tokenFactoryContract = new Token(
        appConfig.markets[market].tokenFactoryAddress,
        wallet
      );

      const amount = new BigNumber(FAUCET_AMOUNTS[symbol]).times(
        10 ** decimals
      );
      const hash = hashMessage(symbol);

      const tx = await tokenFactoryContract.functions
        .mint({ Address: { bits: account } }, hash, amount.toString())
        .call();

      const transactionResult = await toast.promise(tx.waitForResult(), {
        pending: {
          render: PendingToast(),
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
