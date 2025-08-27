import { useQuery } from '@tanstack/react-query';
import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useUtilization = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: ['utilization', 'v1', marketContract?.id],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value } = await marketContract.functions.get_utilization().get();

      if (!value) throw new Error('Failed to fetch utilization');
      return value;
    },
    enabled: !!marketContract,
  });
};
