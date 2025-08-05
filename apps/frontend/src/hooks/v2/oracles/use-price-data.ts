import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { DateTime } from 'fuels';
import type { OracleInputInput } from '@/contract-types/v2/Market';
import { useMarketStore } from '@/stores/market-store';
import { useOracleAssetConfigurations } from './use-oracle-asset-configurations';
import { usePythOracle } from './use-pyth-oracle';
import { useRedstoneOracle } from './use-redstone-oracle';

export const usePriceData = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;

  const { data: oracleAssetConfigurations } =
    useOracleAssetConfigurations(marketParam);
  const { data: pythOracleData, isError: isPythOracleError } =
    usePythOracle(market);
  const { data: redstoneOracleData, isError: isRedstoneOracleError } =
    useRedstoneOracle(market);

  return useQuery({
    queryKey: [
      'priceData',
      'v2',
      oracleAssetConfigurations,
      pythOracleData?.timestamp,
      redstoneOracleData?.timestamp,
    ],
    queryFn: () => {
      const prices = new Map<
        string,
        {
          price: BigNumber;
          confidence: BigNumber;
          oracle: 'Redstone' | 'Pyth' | 'Stork';
        }[]
      >();
      const oracleInputs: OracleInputInput[] = [];
      let totalUpdateFee = BigNumber(0);

      // Initalize all assetIds with an empty array
      for (const assetId of oracleAssetConfigurations?.keys() ?? []) {
        prices.set(assetId, []);
      }

      if (pythOracleData) {
        for (const [assetId, price] of pythOracleData.pythPrices.entries()) {
          prices.get(assetId)?.push({ ...price, oracle: 'Pyth' });
        }
        oracleInputs.push(pythOracleData.pythOracleInput);
        totalUpdateFee = totalUpdateFee.plus(pythOracleData.updateFee);
      }

      if (redstoneOracleData) {
        for (const [assetId, price] of redstoneOracleData.prices.entries()) {
          prices.get(assetId)?.push({
            price,
            confidence: BigNumber(0),
            oracle: 'Redstone',
          });
        }

        oracleInputs.push(redstoneOracleData.redstoneOracleInput);
        totalUpdateFee = totalUpdateFee.plus(redstoneOracleData.updateFee);
      }

      const timestamp = DateTime.now();

      return {
        timestamp,
        prices,
        oracleInputs,
        totalUpdateFee,
      };
    },
    enabled:
      !!oracleAssetConfigurations &&
      (!!pythOracleData || isPythOracleError) &&
      (!!redstoneOracleData || isRedstoneOracleError),
    placeholderData: keepPreviousData,
  });
};
