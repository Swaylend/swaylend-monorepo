import type { CollateralConfigurationOutput } from '@/contract-types/Market';
import { getCollateralConfigurations } from '@/lib/queries';
import { useQuery } from '@tanstack/react-query';

export const useCollateralConfigurations = () => {
  const fetchCollateralConfigurations = async () => {
    const configurations = await getCollateralConfigurations();

    const formattedConfigurations: Record<
      string,
      CollateralConfigurationOutput
    > = {};
    configurations.forEach((config) => {
      formattedConfigurations[config.id] = {
        asset_id: config.id,
        paused: config.paused,
        price_feed_id: config.priceFeedId,
        decimals: config.decimals,
        borrow_collateral_factor: config.borrowCollateralFactor,
        liquidate_collateral_factor: config.liquidateCollateralFactor,
        supply_cap: config.supplyCap,
        liquidation_penalty: config.liquidationPenalty,
      };
    });
    return formattedConfigurations;
  };
  return useQuery({
    queryKey: ['collateralConfigurations'],
    queryFn: () => fetchCollateralConfigurations(),
  });
};
