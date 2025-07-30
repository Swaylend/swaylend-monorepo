import { useQuery } from '@tanstack/react-query';

import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useMarketBasicsWithInterest = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'marketBasicsWithInterest',
      'v1',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value } = await marketContract.functions
        .get_market_basics_with_interest()
        .get();

      if (!value) throw new Error('Failed to fetch marketBasicsWithInterest');
      return value;
    },
    enabled: !!marketContract,
  });
};
