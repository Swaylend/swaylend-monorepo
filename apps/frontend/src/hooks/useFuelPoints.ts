import { appConfig } from '@/configs';
import { getFormattedNumber } from '@/utils';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

type OblApiResponse = {
  user_address: string;
  total_points: number;
  rank: number;
};

function randomDouble(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const useFuelPoints = () => {
  const { account } = useAccount();

  return useQuery<string>({
    queryKey: ['fuelPoints', account],
    queryFn: async () => {
      if (!account) return getFormattedNumber(BigNumber(0));

      // On testnet just return some random data that we can use for testing
      if (appConfig.env === 'testnet') {
        return getFormattedNumber(BigNumber(randomDouble(0, 1000000)));
      }

      try {
        const response = await fetch(
          `${appConfig.client.fuelOblApi}/fuel/epoch1_leaderboard?user_address=${account.toLowerCase()}`
        );

        if (!response.ok) {
          return getFormattedNumber(BigNumber(0));
        }

        const data = (await response.json()) as
          | OblApiResponse[]
          | null
          | undefined;

        if (!data || data.length === 0) {
          return getFormattedNumber(BigNumber(0));
        }

        const points = data[0].total_points;

        if (!points) {
          return getFormattedNumber(BigNumber(0));
        }

        return getFormattedNumber(BigNumber(points));
      } catch (e) {
        console.log(e);
        return getFormattedNumber(BigNumber(0));
      }
    },
    enabled: !!account,
  });
};
