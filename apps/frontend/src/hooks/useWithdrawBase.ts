import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import type { PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { PythContract } from '@pythnetwork/pyth-fuel-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { useMarketConfiguration } from './useMarketConfiguration';

export const useWithdrawBase = () => {
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
    mutationKey: ['withdrawBase', account, market, marketConfiguration],
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

      const pythContract = new PythContract(
        appConfig.markets[market].oracleAddress,
        wallet
      );

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
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
            assetId: appConfig.baseAssetId,
          },
        })
        .addContracts([pythContract])
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
