import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { useCollateralConfigurations } from './useCollateralConfigurations';

type useSupplyCollateralProps = {
  actionTokenAssetId: string | null | undefined;
};

export const useSupplyCollateral = ({
  actionTokenAssetId,
}: useSupplyCollateralProps) => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const {
    changeTokenAmount,
    changeInputDialogOpen,
    changeSuccessDialogOpen,
    changeSuccessDialogTransactionId,
    changeActionActive,
  } = useMarketStore();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      'supplyCollateral',
      actionTokenAssetId,
      account,
      market,
      collateralConfigurations,
    ],
    mutationFn: async (tokenAmount: BigNumber) => {
      if (
        !wallet ||
        !account ||
        !actionTokenAssetId ||
        !collateralConfigurations
      ) {
        return null;
      }

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
        wallet
      );

      const amount = new BigNumber(tokenAmount).times(
        10 ** collateralConfigurations[actionTokenAssetId].decimals
      );

      const { waitForResult } = await marketContract.functions
        .supply_collateral()
        .callParams({
          forward: {
            assetId: actionTokenAssetId,
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
        changeActionActive(false);
      }
    },
    onError: (error) => {
      ErrorToast({ error: error.message });
      changeActionActive(false);
    },
    onSettled: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        exact: false,
        queryKey: ['collateralAssets', account, market],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, actionTokenAssetId],
      });
    },
  });
};
