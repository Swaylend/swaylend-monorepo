import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { Market } from '@/contract-types';
import type { PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, FUEL_ETH_BASE_ASSET_ID } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { useMarketConfiguration } from './useMarketConfiguration';

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

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['borrowBase', account, marketConfiguration, market],
    mutationFn: async ({
      tokenAmount,
      priceUpdateData,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
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
        .withdraw_base(amount.toFixed(0), priceUpdateData)
        .callParams({
          forward: {
            amount: priceUpdateData.update_fee,
            assetId: FUEL_ETH_BASE_ASSET_ID,
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
    onMutate: async ({
      tokenAmount,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
      if (!marketConfiguration) return null;

      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ['userSupplyBorrow'] });

      // Snapshot the current state
      const previousSupplyBorrow = queryClient.getQueryData<{
        supplied: BigNumber;
        borrowed: BigNumber;
      } | null>(['userSupplyBorrow', account, market]);

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );

      // Optmistic update
      queryClient.setQueryData(['userSupplyBorrow', account, market], () => ({
        supplied: new BigNumber(0),
        borrowed: new BigNumber(previousSupplyBorrow?.borrowed ?? 0).plus(
          amount
        ),
      }));

      return { previousSupplyBorrow };
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
