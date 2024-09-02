import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';
import { useCollateralConfigurations } from './useCollateralConfigurations';

export const useTotalCollateral = () => {
  const provider = useProvider();
  const { market } = useMarketStore();
  const { data: collateralConfigurations } = useCollateralConfigurations();

  return useQuery({
    queryKey: ['totalCollateral', market, collateralConfigurations],
    queryFn: async () => {
      if (!provider || !collateralConfigurations) return;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const promises = Object.keys(collateralConfigurations).map(
        async (assetId) => ({
          assetId,
          value: await marketContract.functions
            .totals_collateral(assetId)
            .get(),
        })
      );

      const data = await Promise.all(promises);

      if (data.length === 0) {
        throw new Error('Failed to fetch totalsCollateral');
      }

      const totals = new Map<string, BigNumber>(
        data.map(({ assetId, value }) => [
          assetId,
          new BigNumber(value.toString()),
        ])
      );

      return totals;
    },
    enabled: !!provider,
  });
};
