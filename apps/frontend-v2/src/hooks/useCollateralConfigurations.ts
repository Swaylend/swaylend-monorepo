import {
  type CollateralConfigurationOutput,
  Market,
} from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import type { DeployedMarket } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useCollateralConfigurations = (marketParam?: DeployedMarket) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

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
    refetchOnWindowFocus: false,
    enabled: !!provider,
  });
};
