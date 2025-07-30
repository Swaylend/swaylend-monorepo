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
import type { PriceDataUpdateInput } from '@/contract-types/v1/Market';
import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { usePythContract } from '@/contracts/v1/use-pyth-contract';
import { useMarketStore } from '@/stores/market-store';
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

  const queryClient = useQueryClient();
  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);

  return useMutation({
    mutationKey: [
      'withdrawBase',
      account,
      marketConfiguration,
      marketContract?.account?.address,
      marketContract?.id,
      pythContract?.account?.address,
      pythContract?.id,
    ],
    mutationFn: async ({
      tokenAmount,
      priceUpdateData,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
      if (!(account && marketConfiguration && marketContract && pythContract)) {
        return null;
      }

      const amount = new BigNumber(tokenAmount).times(
        10 ** marketConfiguration.baseTokenDecimals
      );

      const { waitForResult } = await marketContract.functions
        .withdraw_base(amount.toFixed(0), priceUpdateData)
        .callParams({
          forward: {
            amount: priceUpdateData.update_fee,
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
        queryKey: [
          'userSupplyBorrow',
          'v1',
          account,
          marketContract?.account?.address,
          marketContract?.id,
        ],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: [
          'balance',
          'v1',
          account,
          marketConfiguration?.baseToken.bits,
        ],
      });
    },
  });
};
