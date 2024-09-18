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
import {
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
  PythContract,
} from '@pythnetwork/pyth-fuel-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { BN } from 'fuels';
import { toast } from 'react-toastify';
import { useCollateralConfigurations } from './useCollateralConfigurations';

type useWithdrawCollateralProps = {
  actionTokenAssetId: string | null | undefined;
};

export const useWithdrawCollateral = ({
  actionTokenAssetId,
}: useWithdrawCollateralProps) => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const {
    market,
    changeTokenAmount,
    changeInputDialogOpen,
    changeSuccessDialogOpen,
    changeSuccessDialogTransactionId,
  } = useMarketStore();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['withdrawCollateral', actionTokenAssetId, account, market],
    mutationFn: async ({
      tokenAmount,
      priceUpdateData,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
      if (
        !wallet ||
        !account ||
        !actionTokenAssetId ||
        !collateralConfigurations
      ) {
        return null;
      }

      const pythContract = new PythContract(
        PYTH_CONTRACT_ADDRESS_SEPOLIA,
        wallet
      );

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        wallet
      );

      const amount = new BigNumber(tokenAmount).times(
        10 ** collateralConfigurations[actionTokenAssetId].decimals
      );

      const { waitForResult } = await marketContract.functions
        .withdraw_collateral(
          actionTokenAssetId,
          amount.toFixed(0),
          priceUpdateData
        )
        .callParams({
          forward: {
            amount: priceUpdateData.update_fee,
            assetId: FUEL_ETH_BASE_ASSET_ID,
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
    onMutate: async ({
      tokenAmount,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
      if (!actionTokenAssetId || !collateralConfigurations) {
        return null;
      }

      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ['collateralAssets'] });
      await queryClient.cancelQueries({ queryKey: ['balance'] });

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

      const previousBalance =
        queryClient.getQueryData<BN | null>([
          'balance',
          account,
          actionTokenAssetId,
        ]) ?? new BN(0);

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
          ).minus(amount),
        })
      );

      queryClient.setQueryData(['balance', account, actionTokenAssetId], () =>
        previousBalance.add(new BN(amount.toString()))
      );

      return { previousCollateralAssets, previousBalance };
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

      if (ctx?.previousBalance) {
        queryClient.setQueryData(
          ['balance', account, actionTokenAssetId],
          ctx.previousBalance
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
