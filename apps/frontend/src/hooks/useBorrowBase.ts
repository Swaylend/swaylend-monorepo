import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { appConfig } from '@/configs';
import type { PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useMarketContract } from '@/contracts/useMarketContract';

export const useBorrowBase = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const {
    market,
    changeTokenAmount,
    changeInputDialogOpen,
    changeSuccessDialogOpen,
    changeSuccessDialogTransactionId,
  } = useMarketStore();
  const { data: marketConfiguration } = useMarketConfiguration();
  const marketContract = useMarketContract();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      'borrowBase',
      account,
      marketConfiguration,
      market,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    mutationFn: async ({
      tokenAmount,
      priceUpdateData,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
      if (!wallet || !account || !marketConfiguration || !marketContract) {
        return null;
      }

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );
      const { waitForResult } = await marketContract.functions
        .withdraw_base(amount.toFixed(0), priceUpdateData)
        .callParams({
          forward: {
            amount: priceUpdateData.update_fee,
            assetId: appConfig.baseAssetId,
          },
        })
        .call();

      const transactionResult = await toast.promise(waitForResult(), {
        pending: {
          render: PendingToast(),
        },
      });

      return transactionResult.transactionId;
    },
    onSuccess: (data) => {
      if (data) {
        TransactionSuccessToast({ transactionId: data });
        changeSuccessDialogTransactionId(data);
        changeInputDialogOpen(false);
        changeTokenAmount(BigNumber(0));
        changeSuccessDialogOpen(true);
      }
    },
    onError: (error) => {
      ErrorToast({ error: error.message });
    },
    onSettled: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['userSupplyBorrow', account, market],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, marketConfiguration?.baseToken.bits],
      });
    },
  });
};
