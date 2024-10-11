import { selectMarket, useMarketStore } from '@/stores';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';
import { useUtilization } from './useUtilization';

export const useSupplyRate = (marketParam?: string) => {
  const provider = useProvider();
  const { data: utilization } = useUtilization(marketParam);
  const market = useMarketStore(selectMarket);
  const marketContract = useMarketContract();

  return useQuery({
    queryKey: [
      'supplyRate',
      utilization?.toString(),
      market,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!provider || !utilization || !marketContract) return null;

      const { value } = await marketContract.functions
        .get_supply_rate(utilization)
        .get();

      if (!value) throw new Error('Failed to fetch supplyRate');
      return new BigNumber(value.toString());
    },
    refetchOnWindowFocus: false,
    enabled: !!utilization && !!provider,
  });
};
