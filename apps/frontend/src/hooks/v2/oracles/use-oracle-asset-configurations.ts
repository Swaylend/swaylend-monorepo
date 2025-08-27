import { useQuery } from '@tanstack/react-query';
import type { OracleAssetConfigurationOutput } from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useOracleAssetConfigurations = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: ['oracleAssetConfigurations', 'v2', marketContract?.id],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value: oracleAssetConfigurations } =
        await marketContract.functions.get_oracle_asset_configurations().get();

      const oracleAssetConfigurationsMap = new Map<
        string,
        OracleAssetConfigurationOutput[]
      >(
        oracleAssetConfigurations.map(
          ([assetId, oracleAssetConfigurations]) => [
            assetId.bits,
            oracleAssetConfigurations,
          ]
        )
      );

      return oracleAssetConfigurationsMap;
    },
    enabled: !!marketContract,
    refetchOnWindowFocus: false,
  });
};
