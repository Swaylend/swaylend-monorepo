import { useAccount } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/v1/toasts';
import { appConfig } from '@/configs';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { usePythContract } from '@/contracts/v2/use-pyth-contract';
import { useMarketStore } from '@/stores/market-store';
import { createStableHash } from '@/utils';
import { usePriceData } from './oracles';
import { useMarketConfiguration } from './use-market-configuration';

export const useWithdrawBase = () => {
  const { account } = useAccount();
  const market = useMarketStore.use.market();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();
  const changeSuccessDialogOpen = useMarketStore.use.changeSuccessDialogOpen();
  const changeSuccessDialogTransactionId =
    useMarketStore.use.changeSuccessDialogTransactionId();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: priceData } = usePriceData(market);

  const queryClient = useQueryClient();
  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);

  return useMutation({
    mutationKey: [
      'withdrawBase',
      account,
      createStableHash(marketConfiguration),
      marketContract?.id,
      pythContract?.id,
      priceData?.timestamp,
    ],
    mutationFn: async ({ tokenAmount }: { tokenAmount: BigNumber }) => {
      if (
        !(
          account &&
          marketConfiguration &&
          marketContract &&
          pythContract &&
          priceData
        )
      ) {
        return null;
      }

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );

      const { waitForResult } = await marketContract.functions
        .withdraw_base(amount.toFixed(0), priceData.oracleInputs)
        .callParams({
          forward: {
            amount: priceData.totalUpdateFee.toFixed(0),
            assetId: appConfig.client.shared.baseAssetId,
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
        queryKey: ['userSupplyBorrow', 'v2', account, marketContract?.id],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: [
          'balance',
          'v2',
          account,
          marketConfiguration?.baseToken.bits,
        ],
      });
    },
  });
};
