import { useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';
import { useMarketContract } from '@/contracts/useMarketContract';

export const useUtilization = (marketParam?: string) => {
  const provider = useProvider();

  const { market: selectedMarket } = useMarketStore();
  const currentMarket = marketParam ?? selectedMarket;
  const marketContract = useMarketContract();

  return useQuery({
    queryKey: [
      'utilization',
      currentMarket,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!provider || !marketContract) return null;

      const { value } = await marketContract.functions.get_utilization().get();

      if (!value) throw new Error('Failed to fetch utilization');
      return value;
    },
    enabled: !!provider,
  });
};
