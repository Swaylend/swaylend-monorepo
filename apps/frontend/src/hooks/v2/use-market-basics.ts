import { useQuery } from '@tanstack/react-query';

import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useMarketBasics = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'marketBasics',
      'v2',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value } = await marketContract.functions
        .get_market_basics()
        .get();

      if (!value) throw new Error('Failed to fetch marketBasics');
      return value;
    },
    enabled: !!marketContract,
  });
};
