import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/v1/toasts';
import { useMarketContract } from '@/contracts/use-market-contract';
import { useMarketStore } from '@/stores/market-store';
import { useAccount } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { useMarketConfiguration } from './use-market-configuration';

export const useSupplyBase = () => {
  const { account } = useAccount();
  const market = useMarketStore.use.market();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();
  const changeSuccessDialogOpen = useMarketStore.use.changeSuccessDialogOpen();
  const changeSuccessDialogTransactionId =
    useMarketStore.use.changeSuccessDialogTransactionId();
  const { data: marketConfiguration } = useMarketConfiguration(market);

  const queryClient = useQueryClient();
  const marketContract = useMarketContract(market);

  return useMutation({
    mutationKey: [
      'supplyBase',
      account,
      marketConfiguration,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    mutationFn: async (tokenAmount: BigNumber) => {
      if (!account || !marketConfiguration || !marketContract) {
        return null;
      }

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );

      const { waitForResult } = await marketContract.functions
        .supply_base()
        .callParams({
          forward: {
            assetId: marketConfiguration.baseToken.bits,
            amount: amount.toFixed(0),
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
        queryKey: [
          'userSupplyBorrow',
          account,
          marketContract?.account?.address,
          marketContract?.id,
        ],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, marketConfiguration?.baseToken.bits],
      });
    },
  });
};
