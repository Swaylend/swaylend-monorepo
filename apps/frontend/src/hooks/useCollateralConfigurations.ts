import type { CollateralConfigurationOutput } from '@/contract-types/Market';
import { selectMarket, useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';
import { useMarketContract } from '@/contracts/useMarketContract';

export const useCollateralConfigurations = (marketParam?: string) => {
  const provider = useProvider();
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract();

  return useQuery({
    queryKey: [
      'collateralConfigurations',
      market,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!provider || !marketContract) return null;

      const { value: collateralConfigurations } = await marketContract.functions
        .get_collateral_configurations()
        .get();

      const formattedConfigurations: Record<
        string,
        CollateralConfigurationOutput
      > = {};

      for (const config of collateralConfigurations) {
        formattedConfigurations[config.asset_id.bits] = {
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
