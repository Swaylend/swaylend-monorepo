import { useQuery } from '@tanstack/react-query';
import type { OracleGlobalConfigurationOutput } from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useOracleGlobalConfigurations = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'oracleGlobalConfigurations',
      'v2',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value: oracleGlobalConfigurations } =
        await marketContract.functions.get_oracle_global_configurations().get();

      const oracleGlobalConfigurationsMap = new Map<
        string,
        OracleGlobalConfigurationOutput
      >(
        oracleGlobalConfigurations.map((oracleGlobalConfiguration, index) => [
          index.toString(),
          oracleGlobalConfiguration,
        ])
      );

      return oracleGlobalConfigurationsMap;
    },
    enabled: !!marketContract,
    refetchOnWindowFocus: false,
  });
};
