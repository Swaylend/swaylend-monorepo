'use client';

import { TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLeaderboardPoints, useUser } from '@/hooks';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export const LeaderboardView = () => {
  const [season, setSeason] = useState<string>('v2');
  const { data: leaderboardPoints, isLoading } = useLeaderboardPoints(season);
  const { data: user, isLoading: isUserLoading } = useUser();

  const userPoints = useMemo(() => {
    if (season === 'v1') {
      return user?.points_v1;
    }
    if (season === 'v2') {
      return user?.points_v2;
    }
    return user?.points_overall;
  }, [season, user]);

  const userRank = useMemo(() => {
    if (season === 'v1') {
      return user?.rank_v1;
    }
    if (season === 'v2') {
      return user?.rank_v2;
    }
    return user?.rank_overall;
  }, [season, user]);

  return (
    <div className="flex w-full items-center justify-center pt-[33px] pb-[55px] sm:pt-[55px]">
      <div className="flex max-w-[750px] flex-col items-center justify-center lg:w-[750px]">
        <div className="font-semibold text-white text-xl">
          Swaylend Leaderboard
        </div>
        <div className="flex w-full items-center justify-center">
          <Tabs
            className="mt-[40px] block sm:mt-[55px]"
            defaultValue={season}
            onValueChange={setSeason}
          >
            <TabsList className="h-[50px] w-[420px] rounded-full">
              <TabsTrigger
                className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                value="v1"
              >
                Season 1
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                value="v2"
              >
                Season 2
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                value="overall"
              >
                Overall
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-[30px] flex w-full justify-between rounded-xl bg-card p-4">
          <div>
            <div className="font-semibold text-moon">Your Rank</div>
            <div
              className={cn(
                'font-semibold text-primary text-xl md:text-2xl',
                isUserLoading && 'animate-pulse'
              )}
            >
              {!userRank || userRank === 0 ? (
                <span className="text-lg md:text-xl">Unranked</span>
              ) : (
                userRank
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-semibold text-moon">Your Points</div>
            <div
              className={cn(
                'text-right font-semibold text-white text-xl md:text-2xl',
                isUserLoading && 'animate-pulse'
              )}
            >
              {userPoints ?? '0'}
            </div>
          </div>
        </div>

        <div className="mt-[55px] flex w-full justify-between max-sm:flex max-sm:flex-col max-sm:text-center">
          <div className="font-semibold text-lg text-white">
            Top Contributors
          </div>
          <div className="flex items-center text-sm text-yellow-100 max-sm:justify-center sm:px-2">
            <TriangleAlert className="mr-1 h-4 w-4" /> Points are updated every
            24 hours
          </div>
        </div>
        <table className="mt-4 w-full">
          <thead>
            <tr className="rounded-xl">
              <th className="rounded-l-xl bg-card p-4 text-left">Rank</th>
              <th className="bg-card p-4 text-left">User</th>
              <th className="rounded-r-xl bg-card p-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3}>
                  <Skeleton className="mt-[30px] h-[40px] w-full rounded-xl" />
                </td>
              </tr>
            ) : (
              leaderboardPoints?.leaderboard.map((user) => {
                return (
                  <tr className="border-b" key={user.address}>
                    <td className="px-4 py-2 text-left font-semibold text-primary">
                      {user[`rank_${season as 'v1' | 'v2' | 'overall'}`]}
                    </td>
                    <td className="px-4 py-2 text-left font-semibold text-lavender">
                      <span className="md:hidden">{`${user.address.slice(
                        0,
                        6
                      )}...${user.address.slice(-4)}`}</span>
                      <span className="max-md:hidden lg:hidden">{`${user.address.slice(
                        0,
                        14
                      )}...${user.address.slice(-14)}`}</span>
                      <span className="max-lg:hidden">{user.address}</span>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-lavender">
                      {user[`points_${season as 'v1' | 'v2' | 'overall'}`]}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
