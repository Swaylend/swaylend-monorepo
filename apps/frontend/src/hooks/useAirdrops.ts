import { appConfig } from '@/configs';
import { useWallet } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export type Airdrop = {
  id: number;
  startDate: string;
  endDate: string;
  token: string;
  contractAddress: string;
  isEligible: {
    isEligible: boolean;
    amount: string;
    treeIndex: number;
  };
  totalAmount: string;
};

export const useAirdrops = () => {
  const { wallet } = useWallet();

  return useQuery({
    queryKey: ['airdrops', wallet?.address],
    queryFn: async () => {
      const result = await fetch(
        `${appConfig.client.swaylendApi}/api/airdrops${wallet?.address ? `?address=${wallet?.address}` : ''}`
      );

      if (!result.ok) {
        throw new Error('Failed to fetch airdrops');
      }

      const data = await result.json();

      return data.airdrops as Airdrop[];
    },
    initialData: null,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
};
