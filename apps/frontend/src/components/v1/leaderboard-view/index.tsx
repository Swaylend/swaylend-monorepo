'use client';
import { useLeaderboardPoints } from '@/hooks';
import { useUser } from '@/hooks/v1';
import { useIsConnected } from '@fuels/react';
import { TriangleAlert } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

export const LeaderboardView = () => {
  const { isConnected } = useIsConnected();
  const { data: leaderboardPoints, isLoading } = useLeaderboardPoints();
  const { data: user, isLoading: isUserLoading } = useUser();

  return (
    <>
      <div className="flex pt-[33px] sm:pt-[55px] pb-[55px] w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center max-w-[750px] lg:w-[750px]">
          <div className="text-xl font-semibold text-white">
            Swaylend Leaderboard
          </div>
          <div className="mt-[20px] font-medium text-md text-white border-yellow-400 border px-4 py-2 rounded-lg bg-linear-to-t from-yellow-400/20 to-yellow-400/10">
            Season 1
          </div>
          {isConnected &&
            (isUserLoading ? (
              <Skeleton className="w-full mt-[30px] h-[114px] rounded-xl" />
            ) : (
              <div className="w-full mt-[30px] flex justify-between bg-card p-4 rounded-xl">
                <div>
                  <div className="text-moon font-semibold">Your Rank</div>
                  <div className="text-primary font-semibold text-xl md:text-2xl">
                    {user?.rank === 0 ? (
                      <span className="text-lg md:text-xl">Unranked</span>
                    ) : (
                      user?.rank
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-moon font-semibold">Your Points</div>
                  <div className="text-white font-semibold text-right text-xl md:text-2xl">
                    {user ? user.points : '0'}
                  </div>
                </div>
              </div>
            ))}
          <div className="max-sm:flex max-sm:flex-col max-sm:text-center w-full mt-[55px] flex justify-between">
            <div className="text-lg text-white font-semibold">
              Top Contributors
            </div>
            <div className="text-sm text-yellow-100 flex items-center sm:px-2 max-sm:justify-center">
              <TriangleAlert className="w-4 h-4 mr-1" /> Points are updated
              every 24 hours
            </div>
          </div>
          <table className="w-full mt-4">
            <thead>
              <tr className="rounded-xl">
                <th className="bg-card p-4 rounded-l-xl text-left">Rank</th>
                <th className="bg-card p-4 text-left">User</th>
                <th className="bg-card p-4 rounded-r-xl text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3}>
                    <Skeleton className="w-full mt-[30px] h-[40px] rounded-xl" />
                  </td>
                </tr>
              ) : (
                <>
                  {leaderboardPoints?.leaderboard.map((user) => {
                    return (
                      <tr key={user.address} className="border-b">
                        <td className="px-4 py-2 text-left text-primary font-semibold">
                          {user.rank}
                        </td>
                        <td className="px-4 py-2 text-left text-lavender font-semibold">
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
                        <td className="px-4 py-2 text-right text-lavender font-semibold">
                          {user.points}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
