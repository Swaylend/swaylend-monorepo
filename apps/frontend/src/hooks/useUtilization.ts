import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useUtilization = (marketParam?: string) => {
  const provider = useProvider();

  const { market: selectedMarket } = useMarketStore();
  const currentMarket = marketParam ?? selectedMarket;

  return useQuery({
    queryKey: ['utilization', currentMarket],
    queryFn: async () => {
      if (!provider) return null;

      const marketContract = new Market(
        appConfig.markets[currentMarket].marketAddress,
        provider
      );

      const { value } = await marketContract.functions.get_utilization().get();

      if (!value) throw new Error('Failed to fetch utilization');
      return value;
    },
    enabled: !!provider,
  });
};
