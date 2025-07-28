import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/v1/toasts';
import { appConfig } from '@/configs';
import { Airdrop } from '@/contract-types/v1/airdrop';
import { useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

type ProofResponse = {
  amount: string;
  proof: string[];
  treeIndex: number;
};

export const useClaimAirdrop = () => {
  const { wallet } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['claimAirdrop'],
    mutationFn: async ({
      contractAddress,
      address,
    }: {
      contractAddress: string;
      address: string;
    }) => {
      if (!wallet) return;
      const result = await fetch(
        `${appConfig.client.swaylendApi}/api/airdrops/proof?contractAddress=${contractAddress}&address=${address}`,
        {
          method: 'GET',
        }
      );

      if (!result.ok) {
        throw new Error('Failed to get proof');
      }

      const data = await result.json();

      const proofResponse = data as ProofResponse;

      const airdropContract = new Airdrop(contractAddress, wallet);

      const tx = await airdropContract.functions
        .claim(
          proofResponse.amount,
          wallet.address.b256Address,
          proofResponse.treeIndex,
          proofResponse.proof,
          { Address: { bits: wallet.address.b256Address } }
        )
        .call();

      const transactionResult = await toast.promise(tx.waitForResult(), {
        pending: {
          render: PendingToast(),
        },
      });

      return {
        transactionId: transactionResult.transactionId,
        treeIndex: proofResponse.treeIndex,
        contractAddress,
      };
    },
    onSuccess: async (data) => {
      if (data) {
        // Invalidate queries
        await queryClient.invalidateQueries({
          queryKey: ['isAirdropClaimed'],
        });

        TransactionSuccessToast({ transactionId: data.transactionId });
      }
    },
    onError: (error) => {
      console.log(error);
      ErrorToast({ error: 'Error claiming airdrop' });
    },
  });
};
