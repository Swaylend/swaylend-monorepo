import { appConfig } from '@/configs';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';

type User = {
  points: number;
  rank: number;
};

export const useUser = () => {
  const { account } = useAccount();
  return useQuery({
    queryKey: ['user', account],
    queryFn: async () => {
      const response = await fetch(
        `${appConfig.client.swaylendApi}/api/users/${account}`
      );

      const data = await response.json();

      if (!data) {
        throw new Error('Failed to get user');
      }

      return data as User;
    },
    enabled: !!account,
    retry: 3,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    gcTime: 2 * 60 * 60 * 1000, // Run GC every 2 hours
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};
