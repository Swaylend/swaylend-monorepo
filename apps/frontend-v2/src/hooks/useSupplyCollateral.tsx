import { Market, Token } from '@/contract-types';
import { useMarketStore } from '@/stores';
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  FAUCET_AMOUNTS,
  TOKENS_BY_ASSET_ID,
} from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';

export const useSupplyCollateral = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { actionTokenAssetId, tokenAmount, changeLoading } = useMarketStore();

  return useMutation({
    mutationKey: ['supplyCollateral', actionTokenAssetId, tokenAmount, account],
    mutationFn: async () => {
      if (
        !wallet ||
        !account ||
        !actionTokenAssetId ||
        actionTokenAssetId === '' ||
        !tokenAmount
      )
        return;
      changeLoading(true);
      const marketContract = new Market(CONTRACT_ADDRESSES.market, wallet);

      const amount = new BigNumber(tokenAmount).times(
        10 ** TOKENS_BY_ASSET_ID[actionTokenAssetId].decimals
      );

      const tx = await marketContract.functions
        .supply_collateral()
        .callParams({
          forward: {
            assetId: actionTokenAssetId,
            amount: amount.toString(),
          },
        })
        .call();

      const transactionResult = await toast.promise(tx.waitForResult(), {
        pending: {
          render: 'TX is pending...',
        },
      });
      changeLoading(false);
      return transactionResult;
    },
    onSuccess: (data) => {
      console.log('Success supplying token:', data);
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
      changeLoading(false);
    },
    onError: (error) => {
      console.error('Error minting token:', error);
      toast('Error');
      changeLoading(false);
    },
  });
};
