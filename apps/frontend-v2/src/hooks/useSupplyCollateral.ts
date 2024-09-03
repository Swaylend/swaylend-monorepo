import { ErrorToast, TransactionSuccessToast } from '@/components/Toasts';
import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation } from '@tanstack/react-query';
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
            amount: amount.toString(),
          },
        })
        .call();

      const transactionResult = await toast.promise(waitForResult(), {
        pending: {
          render: 'Transaction is pending...',
        },
      });

      return transactionResult.transactionId;
    },
    onSuccess: (data) => {
      if (data) {
        TransactionSuccessToast({ transactionId: data });
      }
    },
    onError: (error) => {
      ErrorToast({ error: error.message });
    },
  });
};
