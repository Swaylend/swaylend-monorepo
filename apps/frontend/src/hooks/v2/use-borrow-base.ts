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
import { useRedstoneContract } from '@/contracts/v2/use-redstone-contract';
import { useMarketStore } from '@/stores/market-store';
import { usePriceData } from './oracles';
import { useMarketConfiguration } from './use-market-configuration';

export const useBorrowBase = () => {
  const { account } = useAccount();
  const market = useMarketStore.use.market();
  const changeTokenAmount = useMarketStore.use.changeTokenAmount();
  const changeInputDialogOpen = useMarketStore.use.changeInputDialogOpen();
  const changeSuccessDialogOpen = useMarketStore.use.changeSuccessDialogOpen();
  const changeSuccessDialogTransactionId =
    useMarketStore.use.changeSuccessDialogTransactionId();
  const { data: marketConfiguration } = useMarketConfiguration();
  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);
  const redstoneContract = useRedstoneContract(market);
  const { data: priceData } = usePriceData(market);

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      'borrowBase',
      account,
      marketConfiguration,
      marketContract?.account?.address,
      marketContract?.id,
      pythContract?.account?.address,
      pythContract?.id,
      redstoneContract?.account?.address,
      redstoneContract?.id,
      priceData?.timestamp,
    ],
    mutationFn: async ({ tokenAmount }: { tokenAmount: BigNumber }) => {
      if (
        !(
          account &&
          marketConfiguration &&
          marketContract &&
          pythContract &&
          redstoneContract &&
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
        .addContracts([pythContract, redstoneContract])
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
          'v2',
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
          'v2',
          account,
          marketConfiguration?.baseToken.bits,
        ],
      });
    },
  });
};
