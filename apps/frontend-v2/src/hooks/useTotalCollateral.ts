import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, collaterals } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';

export const useTotalCollateral = () => {
  const provider = useProvider();
  const { market } = useMarketStore();

  return useQuery({
    queryKey: ['totalCollateral', market],
    queryFn: async () => {
      if (!provider) return;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const promises = collaterals.map((b) =>
        marketContract.functions.totals_collateral(b.assetId).get()
      );

      const data = await Promise.all(promises);

      if (data.length === 0) {
        throw new Error('Failed to fetch totalsCollateral');
      }

      const v = data.reduce((acc: Record<string, BigNumber>, res, index) => {
        if (res == null) return acc;
        const assetId = collaterals[index].assetId;
        acc[assetId] = new BigNumber(res.value.toString());
        return acc;
      }, {});

      return v;
    },
    enabled: !!provider,
  });
};
