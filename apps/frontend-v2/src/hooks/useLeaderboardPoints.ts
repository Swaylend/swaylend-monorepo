import { SWAYLEND_API } from '@/utils';
import { useQuery } from '@tanstack/react-query';

type User = {
  rank: number;
  totalPoints: number;
  address: string;
};
type Leaderboard = {
  leaderboard: User[];
};

export const useLeaderboardPoints = () => {
  return useQuery({
    queryKey: ['leaderboardPoints'],
    queryFn: async () => {
      const response = await fetch(`${SWAYLEND_API}/api/points`);

      const data = await response.json();

      if (!data) {
        throw new Error('Failed to get points');
      }

      return data as Leaderboard;
    },
    retry: 3,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    gcTime: 60 * 60 * 1000, // Run GC every hour
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};
