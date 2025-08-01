import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { DateTime } from 'fuels';
import type { OracleInputInput } from '@/contract-types/v2/Market';
import { useMarketStore } from '@/stores/market-store';
import { useOracleAssetConfigurations } from './use-oracle-asset-configurations';
import { usePythOracle } from './use-pyth-oracle';

export const usePriceData = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;

  const { data: oracleAssetConfigurations } =
    useOracleAssetConfigurations(marketParam);
  const { data: pythOracleData, isError: isPythOracleError } =
    usePythOracle(market);

  return useQuery({
    queryKey: [
      'priceData',
      'v2',
      oracleAssetConfigurations,
      pythOracleData?.timestamp,
    ],
    queryFn: () => {
      const prices = new Map<
        string,
        { price: BigNumber; confidence: BigNumber }[]
      >();
      const oracleInputs: OracleInputInput[] = [];
      let totalUpdateFee = BigNumber(0);

      // Initalize all assetIds with an empty array
      for (const assetId of oracleAssetConfigurations?.keys() ?? []) {
        prices.set(assetId, []);
      }

      if (pythOracleData) {
        for (const [assetId, price] of Object.entries(
          pythOracleData.pythPrices
        )) {
          prices.get(assetId)?.push(price);
        }
        oracleInputs.push(pythOracleData.pythOracleInput);
        totalUpdateFee = totalUpdateFee.plus(pythOracleData.updateFee);
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
      !!oracleAssetConfigurations && (!!pythOracleData || isPythOracleError),
    placeholderData: keepPreviousData,
  });
};
