import { SWAYLEND_API } from '@/utils';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';

type User = {
  inviteCode: string;
  redeemedInviteCode: boolean;
  points: number;
  rank: number;
};

export const useUser = () => {
  const { account } = useAccount();
  return useQuery({
    queryKey: ['user', account],
    queryFn: async () => {
      const response = await fetch(`${SWAYLEND_API}/api/users/${account}`);

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
  });
};
