import { useMarketStore } from '@/stores';

import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';
import { useMarketContract } from '@/contracts/useMarketContract';

export const useMarketBasics = (marketParam?: string) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract();

  return useQuery({
    queryKey: [
      'marketBasics',
      market,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!provider || !marketContract) return null;

      const { value } = await marketContract.functions
        .get_market_basics()
        .get();

      if (!value) throw new Error('Failed to fetch marketBasics');
      return value;
    },
    enabled: !!provider,
  });
};
