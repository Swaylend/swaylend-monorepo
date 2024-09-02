import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useUtilization = () => {
  const provider = useProvider();

  const { market } = useMarketStore();

  return useQuery({
    queryKey: ['utilization', market],
    queryFn: async () => {
      if (!provider) return;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const { value } = await marketContract.functions.get_utilization().get();

      if (!value) throw new Error('Failed to fetch utilization');
      return value;
    },
    enabled: !!provider,
  });
};
