import { getMarketConfiguration } from '@/lib/queries';
import { useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';

export const useMarketConfiguration = () => {
  const { market } = useMarketStore();

  return useQuery({
    queryKey: ['marketConfiguration', market],
    queryFn: async () => {
      const configuration = await getMarketConfiguration(market);

      return configuration[0];
    },
  });
};
