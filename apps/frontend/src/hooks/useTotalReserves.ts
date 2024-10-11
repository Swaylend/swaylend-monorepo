import { selectMarket, useMarketStore } from '@/stores';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';

export const useTotalReserves = (marketParam?: string) => {
  const provider = useProvider();
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract();

  return useQuery({
    queryKey: [
      'totalReserves',
      market,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!provider || !marketContract) return BigNumber(0);

      const { value } = await marketContract.functions.get_reserves().get();
      return BigNumber(value.underlying.toString()).minus(
        BigNumber(2).pow(255)
      );
    },
    refetchOnWindowFocus: false,
    enabled: !!provider,
  });
};
