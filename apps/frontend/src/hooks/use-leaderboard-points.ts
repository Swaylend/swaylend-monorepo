import { appConfig } from '@/configs';
import { useQuery } from '@tanstack/react-query';

type User = {
  rank: number;
  points: number;
  address: string;
};
type Leaderboard = {
  leaderboard: User[];
};

export const useLeaderboardPoints = () => {
  return useQuery({
    queryKey: ['leaderboardPoints'],
    queryFn: async () => {
      const response = await fetch(
        `${appConfig.client.swaylendApi}/api/points`
      );

      const data = await response.json();

      if (!data) {
        throw new Error('Failed to get points');
      }

      return data as Leaderboard;
    },
    retry: 3,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    gcTime: 2 * 60 * 60 * 1000, // Run GC every 2 hours
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};
