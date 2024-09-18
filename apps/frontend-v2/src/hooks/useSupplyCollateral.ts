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
        DEPLOYED_MARKETS[market].marketAddress,
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
    onMutate: async (tokenAmount: BigNumber) => {
      if (!actionTokenAssetId || !collateralConfigurations) {
        return null;
      }

      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ['collateralAssets'] });

      // Snapshot the current state
      const previousCollateralAssets = queryClient.getQueryData<Record<
        string,
        BigNumber
      > | null>([
        'collateralAssets',
        account,
        market,
        collateralConfigurations,
      ]);

      if (!previousCollateralAssets) return null;

      const amount = new BigNumber(tokenAmount).times(
        10 ** collateralConfigurations[actionTokenAssetId].decimals
      );

      // Optmistic update
      queryClient.setQueryData(
        ['collateralAssets', account, market, collateralConfigurations],
        () => ({
          ...previousCollateralAssets,
          [actionTokenAssetId]: new BigNumber(
            previousCollateralAssets[actionTokenAssetId] ?? 0
          ).plus(amount),
        })
      );

      return { previousCollateralAssets };
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
      if (ctx?.previousCollateralAssets) {
        queryClient.setQueryData(
          ['collateralAssets', account, market],
          ctx.previousCollateralAssets
        );
      }
    },
    onSettled: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: [
          'collateralAssets',
          account,
          market,
          collateralConfigurations,
        ],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, actionTokenAssetId],
      });
    },
  });
};
