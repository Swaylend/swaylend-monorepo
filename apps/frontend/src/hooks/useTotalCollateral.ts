import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';

import { appConfig } from '@/configs';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useProvider } from './useProvider';

export const useTotalCollateral = (marketParam?: string) => {
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
        appConfig.markets[market].marketAddress,
        provider
      );

      const totalsCollateral = await marketContract.functions
        .get_all_totals_collateral()
        .get();

      const totals = new Map<string, BigNumber>(
        totalsCollateral.value.map(([assetId, value]) => [
          assetId.bits,
          new BigNumber(value.toString()),
        ])
      );

      return totals;
    },
    enabled: !!provider && !!collateralConfigurations,
  });
};
