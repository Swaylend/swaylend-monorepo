import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { useMarketStore } from '@/stores/market-store';
import { useUtilization } from './use-utilization';

export const useSupplyRate = (marketParam?: string) => {
  const { data: utilization } = useUtilization(marketParam);
  const market = useMarketStore.use.market();
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: ['supplyRate', 'v1', marketContract?.id, utilization?.toString()],
    queryFn: async () => {
      if (!(utilization && marketContract)) return null;

      const { value } = await marketContract.functions
        .get_supply_rate(utilization)
        .get();

      if (!value) throw new Error('Failed to fetch supplyRate');
      return new BigNumber(value.toString());
    },
    refetchOnWindowFocus: false,
    enabled: !!utilization && !!marketContract,
  });
};
