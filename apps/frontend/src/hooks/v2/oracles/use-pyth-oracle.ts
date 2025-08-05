import { HermesClient, type PriceUpdate } from '@pythnetwork/hermes-client';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify, DateTime } from 'fuels';
import { useState } from 'react';
import {
  type OracleInputInput,
  OracleTypeOutput,
} from '@/contract-types/v2/Market';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { usePythContract } from '@/contracts/v2/use-pyth-contract';
import { useMarketStore } from '@/stores/market-store';
import { useProvider } from '../../use-provider';
import { useOraclePriceFeedData } from './use-oracle-price-feed-data';

export const usePythOracle = (marketParam?: string) => {
  const [hermesClient, _] = useState(
    () =>
      new HermesClient(
        process.env.NEXT_PUBLIC_HERMES_API ?? 'https://hermes.pyth.network',
        {
          httpRetries: 1,
          timeout: 3000,
        }
      )
  );

  const { provider } = useProvider();

  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);

  const { data: oraclePriceFeedData } = useOraclePriceFeedData(market);

  const pythPriceFeedIds = oraclePriceFeedData?.oraclePriceFeeds.get(
    OracleTypeOutput.Pyth
  );

  const pythOracleId = oraclePriceFeedData?.oracleTypeToOracleId.get(
    OracleTypeOutput.Pyth
  );

  return useQuery({
    queryKey: [
      'pythPrices',
      'v2',
      marketContract?.account?.address,
      marketContract?.id,
      pythContract?.account?.address,
      pythContract?.id,
      pythPriceFeedIds,
      pythOracleId,
    ],
    queryFn: async () => {
      if (
        !(
          oraclePriceFeedData &&
          marketContract &&
          pythContract &&
          pythPriceFeedIds &&
          pythOracleId
        )
      ) {
        return null;
      }

      // Fetch price updates from Hermes client
      let priceUpdates: PriceUpdate | null = null;
      try {
        priceUpdates =
          await hermesClient.getLatestPriceUpdates(pythPriceFeedIds);
      } catch (_error) {
        const client = new HermesClient('https://hermes.pyth.network');

        priceUpdates = await client.getLatestPriceUpdates(pythPriceFeedIds);
      }

      if (!priceUpdates?.parsed || priceUpdates.parsed.length === 0) {
        throw new Error('Failed to fetch price');
      }

      const buffer = Buffer.from(priceUpdates.binary.data[0], 'hex');
      const updateData = [arrayify(buffer)];

      const { value: fee } = await pythContract.functions
        .update_fee(updateData)
        .get();

      // Prepare the PythOracleInput object
      const pythOracleInput: OracleInputInput = {
        Pyth: {
          oracle_id: pythOracleId,
          publish_times: priceUpdates.parsed.map((parsedPrice) =>
            DateTime.fromUnixSeconds(parsedPrice.price.publish_time).toTai64()
          ),
          price_feed_ids: pythPriceFeedIds,
          update_data: updateData,
        },
      };

      // Format prices to BigNumber
      // AssetId -> Price
      const prices = new Map<
        string,
        { price: BigNumber; confidence: BigNumber }
      >(
        priceUpdates.parsed.map((parsedPrice) => [
          oraclePriceFeedData.priceFeedIdToAssetId.get(`0x${parsedPrice.id}`)!,
          {
            price: BigNumber(parsedPrice.price.price).times(
              BigNumber(10).pow(BigNumber(parsedPrice.price.expo))
            ),
            confidence: BigNumber(parsedPrice.price.conf).times(
              BigNumber(10).pow(BigNumber(parsedPrice.price.expo))
            ),
          },
        ])
      );

      const timestamp = DateTime.now();

      return {
        timestamp,
        pythPrices: prices,
        pythOracleInput,
        updateFee: BigNumber(fee.toString()),
      };
    },
    refetchInterval: 5000,
    enabled: !!provider && !!marketContract && !!pythContract,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
};
