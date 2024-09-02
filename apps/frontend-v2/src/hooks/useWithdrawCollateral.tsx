import { Market } from '@/contract-types';
import type { PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import {
  DEPLOYED_MARKETS,
  EXPLORER_URL,
  FUEL_ETH_BASE_ASSET_ID,
  TOKENS_BY_ASSET_ID,
} from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import {
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
  PythContract,
} from '@pythnetwork/pyth-fuel-js';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';

type useWithdrawCollateralProps = {
  actionTokenAssetId: string | null;
};

export const useWithdrawCollateral = ({
  actionTokenAssetId,
}: useWithdrawCollateralProps) => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();

  return useMutation({
    mutationKey: ['withdrawCollateral', actionTokenAssetId, account, market],
    mutationFn: async ({
      tokenAmount,
      priceUpdateData,
    }: {
      tokenAmount: BigNumber;
      priceUpdateData: PriceDataUpdateInput;
    }) => {
      if (!wallet || !account || !actionTokenAssetId) {
        return;
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
        10 ** TOKENS_BY_ASSET_ID[actionTokenAssetId].decimals
      );

      const { waitForResult } = await marketContract.functions
        .withdraw_collateral(
          actionTokenAssetId,
          amount.toString(),
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
          render: 'Transaction is pending...',
        },
      });

      return transactionResult.transactionId;
    },
    onSuccess: (data) => {
      if (data) {
        toast(
          <div>
            Transaction successful:{' '}
            <a
              target="_blank"
              rel="noreferrer"
              className="underline cursor-pointer text-blue-500"
              href={`${EXPLORER_URL}/${data}`}
            >
              {data}
            </a>
          </div>
        );
      }
    },
    onError: (error) => {
      console.log(error);
      toast('Error');
    },
  });
};
