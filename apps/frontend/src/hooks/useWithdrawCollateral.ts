import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import type { PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { FUEL_ETH_BASE_ASSET_ID } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import {
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
  PythContract,
} from '@pythnetwork/pyth-fuel-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
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
        appConfig.markets[market].marketAddress,
        wallet
      );

      const amount = new BigNumber(tokenAmount).times(
        10 ** collateralConfigurations[actionTokenAssetId].decimals
      );

      const { waitForResult } = await marketContract.functions
        .withdraw_collateral(
          { bits: actionTokenAssetId },
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
