import { appConfig } from '@/configs';
import { getFormattedNumber } from '@/utils';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

type OblApiResponse = {
  user_address: string;
  total_points: number;
  passive_points: number;
  active_points: number;
  gas_points: number;
};

function randomDouble(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const useFuelPoints = () => {
  const { account } = useAccount();

  return useQuery<string>({
    queryKey: ['fuelPoints', account],
    queryFn: async () => {
      // On testnet just return some random data that we can use for testing
      if (appConfig.env === 'testnet') {
        return getFormattedNumber(BigNumber(randomDouble(0, 1000000)));
      }

      // TODO: Fetch from API (Mainnet)
      return getFormattedNumber(BigNumber(randomDouble(0, 1000000)));
    },
    enabled: !!account,
  });
};
