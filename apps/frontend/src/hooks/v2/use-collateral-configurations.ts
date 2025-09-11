import { useQuery } from '@tanstack/react-query';
import type { CollateralConfigurationOutput } from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useCollateralConfigurations = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: ['collateralConfigurations', 'v2', marketContract?.id],
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
          decimals: config.decimals,
          borrow_collateral_factor: config.borrow_collateral_factor,
          liquidate_collateral_factor: config.liquidate_collateral_factor,
          supply_cap: config.supply_cap,
          liquidation_penalty: config.liquidation_penalty,
          oracle_max_confidence_width: config.oracle_max_confidence_width,
        };
      }

      return formattedConfigurations;
    },
    refetchOnWindowFocus: false,
    enabled: !!marketContract,
  });
};
