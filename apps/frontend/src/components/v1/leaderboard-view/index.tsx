'use client';
import { useIsConnected } from '@fuels/react';
import { TriangleAlert } from 'lucide-react';
import { useLeaderboardPoints } from '@/hooks';
import { useUser } from '@/hooks/v1';
import { Skeleton } from '../../ui/skeleton';

export const LeaderboardView = () => {
  const { isConnected } = useIsConnected();
  const { data: leaderboardPoints, isLoading } = useLeaderboardPoints();
  const { data: user, isLoading: isUserLoading } = useUser();

  return (
    <div className="flex w-full items-center justify-center pt-[33px] pb-[55px] sm:pt-[55px]">
      <div className="flex max-w-[750px] flex-col items-center justify-center lg:w-[750px]">
        <div className="font-semibold text-white text-xl">
          Swaylend Leaderboard
        </div>
        <div className="mt-[20px] rounded-lg border border-yellow-400 bg-linear-to-t from-yellow-400/20 to-yellow-400/10 px-4 py-2 font-medium text-md text-white">
          Season 1
        </div>
        {isConnected &&
          (isUserLoading ? (
            <Skeleton className="mt-[30px] h-[114px] w-full rounded-xl" />
          ) : (
            <div className="mt-[30px] flex w-full justify-between rounded-xl bg-card p-4">
              <div>
                <div className="font-semibold text-moon">Your Rank</div>
                <div className="font-semibold text-primary text-xl md:text-2xl">
                  {user?.rank === 0 ? (
                    <span className="text-lg md:text-xl">Unranked</span>
                  ) : (
                    user?.rank
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-semibold text-moon">Your Points</div>
                <div className="text-right font-semibold text-white text-xl md:text-2xl">
                  {user ? user.points : '0'}
                </div>
              </div>
            </div>
          ))}
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
                      {user.rank}
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
                      {user.points}
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
