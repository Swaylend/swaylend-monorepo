import type { MarketAbi } from '@src/contract-types';
import type { CollateralConfigurationOutput } from '@src/contract-types/MarketAbi';
import { useQuery } from '@tanstack/react-query';

export const useCollateralConfigurations = (marketContract: MarketAbi) => {
  const fetchCollateralConfigurations = async () => {
    const result = await marketContract.functions
      .get_collateral_configurations()
      .get();
    if (!result || !result.value)
      throw new Error('Failed to fetch collateral configurations');

    return result.value.reduce((acc, res, index) => {
      if (res == null) return acc;
      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      return { ...acc, [res.asset_id]: res };
    }, {}) as Record<string, CollateralConfigurationOutput>;
  };

  return useQuery({
    queryKey: ['collateralConfigurations'],
    queryFn: fetchCollateralConfigurations,
  });
};
