import { selectMarket, useMarketStore } from '@/stores';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useMarketBasics = (marketParam?: string) => {
  const provider = useProvider();
  const storeMarket = useMarketStore(selectMarket);
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
