import { selectMarket, useMarketStore } from '@/stores';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useUtilization } from './useUtilization';

export const useSupplyRate = (marketParam?: string) => {
  const { data: utilization } = useUtilization(marketParam);
  const market = useMarketStore(selectMarket);
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'supplyRate',
      utilization?.toString(),
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!utilization || !marketContract) return null;

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
