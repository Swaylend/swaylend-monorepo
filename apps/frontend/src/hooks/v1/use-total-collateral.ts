import { useMarketStore } from '@/stores/market-store';

import { useMarketContract } from '@/contracts/use-market-contract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './use-collateral-configurations';

export const useTotalCollateral = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'totalCollateral',
      collateralConfigurations,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!collateralConfigurations || !marketContract) {
        return null;
      }

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
    enabled: !!collateralConfigurations && !!marketContract,
  });
};
