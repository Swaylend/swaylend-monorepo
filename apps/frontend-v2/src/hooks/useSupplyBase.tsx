import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, EXPLORER_URL, TOKENS_BY_SYMBOL } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';

export const useSupplyBase = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();

  return useMutation({
    mutationKey: ['supplyBase', account, market],
    mutationFn: async (tokenAmount: BigNumber) => {
      if (!wallet || !account) {
        return;
      }

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        wallet
      );

      const amount = new BigNumber(tokenAmount).times(
        10 ** TOKENS_BY_SYMBOL.USDC.decimals
      );

      const { waitForResult } = await marketContract.functions
        .supply_base()
        .callParams({
          forward: {
            assetId: TOKENS_BY_SYMBOL.USDC.assetId,
            amount: amount.toString(),
          },
        })
        .call();

      const transactionResult = await toast.promise(waitForResult(), {
        pending: {
          render: 'Transaction is pending...',
        },
      });

      return transactionResult.transactionId;
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
              href={`${EXPLORER_URL}/${data}`}
            >
              {data}
            </a>
          </div>
        );
      }
    },
    onError: (error) => {
      console.log(error);
      toast('Error');
    },
  });
};
