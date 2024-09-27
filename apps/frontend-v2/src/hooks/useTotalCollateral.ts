import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useProvider } from './useProvider';

export const useTotalCollateral = (marketParam?: DeployedMarket) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);

  return useQuery({
    queryKey: ['totalCollateral', market, collateralConfigurations],
    queryFn: async () => {
      if (!provider || !collateralConfigurations) return null;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      // FIXME: Add contract methods to fetch all data at once
      const promises = Object.keys(collateralConfigurations).map(
        async (assetId) => ({
          assetId,
          value: await marketContract.functions
            .totals_collateral({ bits: assetId })
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
          new BigNumber(value.value.toString()),
        ])
      );

      return totals;
    },
    enabled: !!provider && !!collateralConfigurations,
  });
};
