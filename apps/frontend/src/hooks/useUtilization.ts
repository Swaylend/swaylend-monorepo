import { useMarketContract } from '@/contracts/useMarketContract';
import { selectMarket, useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';

export const useUtilization = (marketParam?: string) => {
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'utilization',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value } = await marketContract.functions.get_utilization().get();

      if (!value) throw new Error('Failed to fetch utilization');
      return value;
    },
    enabled: !!marketContract,
  });
};
