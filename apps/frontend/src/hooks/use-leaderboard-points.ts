import { useQuery } from '@tanstack/react-query';
import { appConfig } from '@/configs';

type User = {
  address: string;
  points_v1: number;
  points_v2: number;
  points_overall: number;
  rank_v1: number;
  rank_v2: number;
  rank_overall: number;
};

type Leaderboard = {
  leaderboard: User[];
};

export const useLeaderboardPoints = (season: string) => {
  return useQuery({
    queryKey: ['leaderboardPoints', season],
    queryFn: async () => {
      const response = await fetch(
        `${appConfig.client.shared.swaylendApi}/api/points?season=${season}`
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
