import { Token } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, EXPLORER_URL, FAUCET_AMOUNTS } from '@/utils';
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
      if (!wallet || !account) return;

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

      return transactionResult;
    },
    onSuccess: (data) => {
      if (data) {
        toast(
          <div>
            Transaction successful:{' '}
            <a
              target="_blank"
              rel="noreferrer"
              className="underline cursor-pointer text-blue-500"
              href={`${EXPLORER_URL}/${data.transactionId}`}
            >
              {data.transactionId}
            </a>
          </div>
        );
      }
    },
    onError: (error) => {
      console.error('Error minting token:', error);
      toast('Error');
    },
  });
};
