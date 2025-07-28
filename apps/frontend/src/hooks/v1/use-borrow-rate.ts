import { useMarketStore } from '@/stores/market-store';

import { useMarketContract } from '@/contracts/use-market-contract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useUtilization } from './use-utilization';

export const useBorrowRate = (marketParam?: string) => {
  const { data: utilization } = useUtilization(marketParam);
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'borrowRate',
      utilization?.toString(),
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!utilization || !marketContract) return null;

      const { value } = await marketContract.functions
        .get_borrow_rate(utilization)
        .get();

      if (!value) throw new Error('Failed to fetch borrowRate');
      return new BigNumber(value.toString());
    },
    refetchOnWindowFocus: false,
    enabled: !!utilization && !!marketContract,
  });
};
