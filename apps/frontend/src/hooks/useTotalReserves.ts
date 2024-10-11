import { useMarketStore } from '@/stores';

import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';
import { useMarketContract } from '@/contracts/useMarketContract';

export const useTotalReserves = (assetId: string, marketParam?: string) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
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
      if (!provider || !assetId || !marketContract) return BigNumber(0);

      const { value } = await marketContract.functions.get_reserves().get();
      return BigNumber(value.underlying.toString()).minus(
        BigNumber(2).pow(255)
      );
    },
    refetchOnWindowFocus: false,
    enabled: !!provider,
  });
};
