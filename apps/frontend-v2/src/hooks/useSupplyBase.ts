import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { BN } from 'fuels';
import { toast } from 'react-toastify';
import { useMarketConfiguration } from './useMarketConfiguration';

export const useSupplyBase = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();
  const { data: marketConfiguration } = useMarketConfiguration();
  const {
    changeTokenAmount,
    changeInputDialogOpen,
    changeSuccessDialogOpen,
    changeSuccessDialogTransactionId,
  } = useMarketStore();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['supplyBase', account, marketConfiguration, market],
    mutationFn: async (tokenAmount: BigNumber) => {
      if (!wallet || !account || !marketConfiguration) {
        return null;
      }

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        wallet
      );

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );

      const { waitForResult } = await marketContract.functions
        .supply_base()
        .callParams({
          forward: {
            assetId: marketConfiguration.baseToken,
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
    onMutate: async (tokenAmount: BigNumber) => {
      if (!marketConfiguration) return null;

      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ['userSupplyBorrow'] });
      await queryClient.cancelQueries({ queryKey: ['balance'] });

      // Snapshot the current state
      const previousSupplyBorrow = queryClient.getQueryData<{
        supplied: BigNumber;
        borrowed: BigNumber;
      } | null>(['userSupplyBorrow', account, market]);

      const previousBalance =
        queryClient.getQueryData<BN | null>([
          'balance',
          account,
          marketConfiguration?.baseToken,
        ]) ?? new BN(0);

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );

      const newSupplyBalance =
        previousSupplyBorrow?.supplied.plus(amount) ?? BigNumber(0);
      const newBorrowBalance =
        previousSupplyBorrow?.borrowed.minus(amount) ?? BigNumber(0);

      // Optmistic update
      queryClient.setQueryData(['userSupplyBorrow', account, market], () => ({
        supplied: newSupplyBalance,
        borrowed: newBorrowBalance?.lt(0) ? new BigNumber(0) : newBorrowBalance,
      }));

      queryClient.setQueryData(
        ['balance', account, marketConfiguration?.baseToken],
        () => previousBalance.sub(new BN(amount.toString()))
      );

      return { previousSupplyBorrow, previousBalance };
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
    onError: (error, _, ctx) => {
      ErrorToast({ error: error.message });

      // Reset to old state
      if (ctx?.previousSupplyBorrow) {
        queryClient.setQueryData(
          ['userSupplyBorrow', account, market],
          ctx.previousSupplyBorrow
        );
      }

      if (ctx?.previousBalance) {
        queryClient.setQueryData(
          ['balance', account, marketConfiguration?.baseToken],
          ctx.previousBalance
        );
      }
    },
    onSettled: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['userSupplyBorrow', account, market],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, marketConfiguration?.baseToken],
      });
    },
  });
};
