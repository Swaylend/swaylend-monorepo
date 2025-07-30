import { useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import { Airdrop } from '@/contract-types/v1/Airdrop';

export const useIsAirdropClaimed = (
  contractAddress: string,
  treeIndex: number
) => {
  const { wallet } = useWallet();

  return useQuery({
    queryKey: ['isAirdropClaimed', contractAddress, treeIndex],
    queryFn: async () => {
      if (!wallet) return false;

      const airdripContract = new Airdrop(contractAddress, wallet);

      const isClaimed = (
        await airdripContract.functions.is_claimed(treeIndex).get()
      ).value;

      return isClaimed;
    },
  });
};
