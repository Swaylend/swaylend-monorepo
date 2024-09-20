'use client';
import { useIsConnected } from '@fuels/react';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

export const LeaderboardView = () => {
  const { isConnected } = useIsConnected();

  return (
    <div className="pt-[33px] sm:pt-[55px] pb-[55px] flex w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center max-w-[750px] lg:w-[750px]">
        <div className="text-xl font-semibold text-white">
          Swaylend Leaderboard
        </div>
        <div className="mt-[20px] font-medium text-md text-white border-yellow-400 border px-4 py-2 rounded-lg bg-gradient-to-t from-yellow-400/20 to-yellow-400/10">
          Season 1
        </div>
        {isConnected && (
          <div className="w-full mt-[30px] flex justify-between bg-card p-4 rounded-xl">
            <div>
              <div className="text-moon font-semibold">Your Rank</div>
              <div className="text-primary text-2xl font-semibold">3850</div>
            </div>
            <div>
              <div className="text-moon font-semibold">Your Points</div>
              <div className="text-white text-2xl font-semibold">13850</div>
            </div>
          </div>
        )}
        {/* <a
        href="#"
        className="mt-[55px] font-medium text-md text-lavender px-4 py-2 hover:opacity-80"
      >
      How it Works
      </a> */}
        <div className="w-full mt-[55px] flex justify-between">
          <div className="text-lg text-white font-semibold">
            Top Contributors
          </div>
          <div className="text-sm text-yellow-100 flex items-center px-2">
            <TriangleAlert className="w-4 h-4" />
            Points are updated every 24 hours
          </div>
        </div>
        <table className="w-full mt-4">
          <thead>
            <tr className="rounded-xl p-4">
              <th className="bg-card p-4 rounded-l-xl text-left">Rank</th>
              <th className="bg-card p-4 text-left">User</th>
              <th className="bg-card p-4 rounded-r-xl text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 text-left text-primary font-semibold">1</td>
              <td className="p-4 text-left text-lavender font-semibold">
                0x2c442fa811c0bddf1f1ac65b3c9ace50be937be1
              </td>
              <td className="p-4 text-right text-lavender font-semibold">
                1334
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
