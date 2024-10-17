import { selectMarket, useMarketStore } from '@/stores';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';

export const useMarketBasicsWithInterest = (marketParam?: string) => {
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'marketBasicsWithInterest',
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
