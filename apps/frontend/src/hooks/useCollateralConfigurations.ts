import type { CollateralConfigurationOutput } from '@/contract-types/Market';
import { useMarketContract } from '@/contracts/useMarketContract';
import { selectMarket, useMarketStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';

export const useCollateralConfigurations = (marketParam?: string) => {
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'collateralConfigurations',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return null;

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
    enabled: !!marketContract,
  });
};
