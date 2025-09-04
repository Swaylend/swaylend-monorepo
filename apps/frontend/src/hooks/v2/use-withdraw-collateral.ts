import { useAccount } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/v2/toasts';
import { appConfig } from '@/configs';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { usePythContract } from '@/contracts/v2/use-pyth-contract';
import { useStorkContract } from '@/contracts/v2/use-stork-contract';
import { useMarketStore } from '@/stores/market-store';
import { createStableHash } from '@/utils';
import { usePriceData } from './oracles';
import { useCollateralConfigurations } from './use-collateral-configurations';

type useWithdrawCollateralProps = {
  actionTokenAssetId: string | null | undefined;
};

export const useWithdrawCollateral = ({
  actionTokenAssetId,
}: useWithdrawCollateralProps) => {
  const { account } = useAccount();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const market = useMarketStore.use.market();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();
  const changeSuccessDialogOpen = useMarketStore.use.changeSuccessDialogOpen();
  const changeSuccessDialogTransactionId =
    useMarketStore.use.changeSuccessDialogTransactionId();
  const { data: priceData } = usePriceData(market);

  const queryClient = useQueryClient();
  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);
  const storkContract = useStorkContract(market);

  return useMutation({
    mutationKey: [
      'withdrawCollateral',
      actionTokenAssetId,
      account,
      createStableHash(collateralConfigurations),
      marketContract?.id,
      pythContract?.id,
      storkContract?.id,
      priceData?.timestamp,
    ],
    mutationFn: async ({ tokenAmount }: { tokenAmount: BigNumber }) => {
      if (
        !(
          account &&
          actionTokenAssetId &&
          collateralConfigurations &&
          marketContract &&
          pythContract &&
          storkContract &&
          priceData
        )
      ) {
        return null;
      }

      const amount = new BigNumber(tokenAmount).times(
        10 ** collateralConfigurations[actionTokenAssetId].decimals
      );

      const { waitForResult } = await marketContract.functions
        .withdraw_collateral(
          { bits: actionTokenAssetId },
          amount.toFixed(0),
          priceData.oracleInputs
        )
        .callParams({
          forward: {
            amount: priceData.totalUpdateFee.toFixed(0),
            assetId: appConfig.client.shared.baseAssetId,
          },
        })
        .addContracts([pythContract, storkContract])
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
        queryKey: ['collateralAssets', 'v2', account, marketContract?.id],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, actionTokenAssetId],
      });
    },
  });
};
