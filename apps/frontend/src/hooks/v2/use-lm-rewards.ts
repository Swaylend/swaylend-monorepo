import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import { appConfig } from '@/configs';

type LMRewards = {
  address: string;
  part_1: string;
  part_2: string;
};

export const useLMRewards = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['lm-rewards', 'v2', account],
    queryFn: async () => {
      const response = await fetch(
        `${appConfig.client.shared.swaylendApi}/api/rewards/lm-fuel/${account?.toLowerCase()}`
      );

      const data = await response.json();

      if (!data) {
        throw new Error('Failed to get liquidity mining rewards');
      }

      return data as LMRewards;
    },
    enabled: !!account,
    retry: 3,
    refetchOnWindowFocus: false,
  });
};
