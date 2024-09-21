import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useMarketBasics = (marketParam?: DeployedMarket) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  return useQuery({
    queryKey: ['marketBasics', market],
    queryFn: async () => {
      if (!provider) return null;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const { value } = await marketContract.functions
        .get_market_basics()
        .get();

      if (!value) throw new Error('Failed to fetch marketBasics');
      return value;
    },
    enabled: !!provider,
  });
};
