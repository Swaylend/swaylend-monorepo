import { appConfig } from '@/configs';
import { getFormattedNumber } from '@/utils';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

type SwaylendApiResponse = {
  points: number;
  rank: number;
};

function randomDouble(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const useSwaylendPoints = () => {
  const { account } = useAccount();

  return useQuery<string>({
    queryKey: ['swaylendPoints', account],
    queryFn: async () => {
      if (!account) return getFormattedNumber(BigNumber(0));

      // On testnet just return some random data that we can use for testing
      if (appConfig.env === 'testnet') {
        return getFormattedNumber(BigNumber(randomDouble(0, 1000000)));
      }

      try {
        const response = await fetch(
          `${appConfig.client.swaylendApi}/api/points/${account.toLowerCase()}`
        );

        if (!response.ok) {
          return getFormattedNumber(BigNumber(0));
        }

        const data = (await response.json()) as
          | SwaylendApiResponse
          | null
          | undefined;

        if (!data) {
          return getFormattedNumber(BigNumber(0));
        }

        const points = data.points;

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
