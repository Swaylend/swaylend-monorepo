import { useMarketStore } from '@/stores/market-store';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useTotalReserves = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'totalReserves',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return BigNumber(0);

      const { value } = await marketContract.functions.get_reserves().get();
      return BigNumber(value.underlying.toString()).minus(
        BigNumber(2).pow(255)
      );
    },
    refetchOnWindowFocus: false,
    enabled: !!marketContract,
  });
};
