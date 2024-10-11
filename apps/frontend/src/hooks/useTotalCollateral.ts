import { useMarketStore } from '@/stores';

import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useProvider } from './useProvider';
import { useMarketContract } from '@/contracts/useMarketContract';
import { stringifySimpleRecord } from '@/utils/stringifySimpleRecord';
import { useMemo } from 'react';

export const useTotalCollateral = (marketParam?: string) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);
  const marketContract = useMarketContract();

  const collateralConfigurationsKey = useMemo(
    () => stringifySimpleRecord(collateralConfigurations),
    [collateralConfigurations]
  );

  return useQuery({
    queryKey: [
      'totalCollateral',
      market,
      collateralConfigurationsKey,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!provider || !collateralConfigurations || !marketContract)
        return null;

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
