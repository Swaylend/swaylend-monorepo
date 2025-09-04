import { useQuery } from '@tanstack/react-query';
import type {
  OraclePriceFeedIdOutput,
  OracleTypeOutput,
} from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useMarketStore } from '@/stores/market-store';
import { createStableHash } from '@/utils';
import { useOracleAssetConfigurations } from './use-oracle-asset-configurations';
import { useOracleGlobalConfigurations } from './use-oracle-global-configurations';

const getOraclePriceFeedId = (
  oraclePriceFeedId: OraclePriceFeedIdOutput
): string => {
  const key = Object.keys(
    oraclePriceFeedId
  )[0] as keyof typeof oraclePriceFeedId;
  const value = oraclePriceFeedId[key];

  if (key === 'Pyth' || key === 'Stork') {
    return value as string; // Already strings
  }

  return ''; // fallback
};

export const useOraclePriceFeedData = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  const { data: oracleAssetConfigurations } =
    useOracleAssetConfigurations(market);
  const { data: oracleGlobalConfigurations } =
    useOracleGlobalConfigurations(market);

  return useQuery({
    queryKey: [
      'oraclePriceFeedData',
      'v2',
      marketContract?.id,
      createStableHash(
        oracleAssetConfigurations
          ? Object.fromEntries(oracleAssetConfigurations)
          : null
      ),
      createStableHash(
        oracleGlobalConfigurations
          ? Object.fromEntries(oracleGlobalConfigurations)
          : null
      ),
    ],
    queryFn: () => {
      if (
        !(
          marketContract &&
          oracleAssetConfigurations &&
          oracleGlobalConfigurations
        )
      ) {
        return null;
      }

      const oraclePriceFeeds = new Map<OracleTypeOutput, string[]>();
      const priceFeedIdToAssetId = new Map<string, string>();
      const oracleTypeToOracleId = new Map<OracleTypeOutput, string>();

      for (const [
        assetId,
        oracleAssetConfiguration,
      ] of oracleAssetConfigurations.entries()) {
        for (const config of oracleAssetConfiguration) {
          const oracleId = config.oracle_id.toString();

          const oracleGlobalConfiguration =
            oracleGlobalConfigurations.get(oracleId);

          if (
            !oracleGlobalConfiguration ||
            oracleGlobalConfiguration.is_disabled ||
            config.is_disabled
          ) {
            continue;
          }

          const oracleType = oracleGlobalConfiguration.oracle_type;
          const priceFeedId = getOraclePriceFeedId(config.price_feed_id);

          oraclePriceFeeds.set(oracleType, [
            ...(oraclePriceFeeds.get(oracleType) ?? []),
            priceFeedId,
          ]);

          priceFeedIdToAssetId.set(priceFeedId, assetId);
          oracleTypeToOracleId.set(oracleType, oracleId);
        }
      }

      return { oraclePriceFeeds, priceFeedIdToAssetId, oracleTypeToOracleId };
    },
    enabled:
      !!marketContract &&
      !!oracleAssetConfigurations &&
      !!oracleGlobalConfigurations,
  });
};
