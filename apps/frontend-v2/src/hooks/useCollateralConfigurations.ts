import {
  Market,
  type CollateralConfigurationOutput,
} from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';
import { DEPLOYED_MARKETS } from '@/utils';

export const useCollateralConfigurations = () => {
  const provider = useProvider();
  const { market } = useMarketStore();

  return useQuery({
    queryKey: ['collateralConfigurations', market],
    queryFn: async () => {
      if (!provider) return null;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const { value: collateralConfigurations } = await marketContract.functions
        .get_collateral_configurations()
        .get();

      const formattedConfigurations: Record<
        string,
        CollateralConfigurationOutput
      > = {};

      for (const config of collateralConfigurations) {
        formattedConfigurations[config.asset_id] = {
          asset_id: config.asset_id,
          paused: config.paused,
          price_feed_id: config.price_feed_id,
          decimals: config.decimals,
          borrow_collateral_factor: config.borrow_collateral_factor,
          liquidate_collateral_factor: config.liquidate_collateral_factor,
          supply_cap: config.supply_cap,
          liquidation_penalty: config.liquidation_penalty,
        };
      }

      return formattedConfigurations;
    },
    refetchInterval: 1000 * 100, // TODO: Check if necessary
    enabled: !!provider,
  });
};
