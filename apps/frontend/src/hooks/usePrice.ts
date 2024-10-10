import { type PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';

import { HermesClient } from '@pythnetwork/hermes-client';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify } from 'fuels';
import { DateTime } from 'fuels';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useProvider } from './useProvider';
import { useMarketContract } from '@/contracts/useMarketContract';
import { usePythContract } from '@/contracts/usePythContract';

export const usePrice = (marketParam?: string) => {
  const hermesClient = new HermesClient(
    process.env.NEXT_PUBLIC_HERMES_API ?? 'https://hermes.pyth.network'
  );
  const provider = useProvider();

  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  const { data: marketConfiguration } = useMarketConfiguration(market);
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);

  const marketContract = useMarketContract();
  const pythContract = usePythContract();
  // Create a map of priceFeedId to assetId
  const priceFeedIdToAssetId = useMemo(() => {
    if (!marketConfiguration || !collateralConfigurations) return null;

    const assets: Map<string, string> = new Map();

    assets.set(
      marketConfiguration.baseTokenPriceFeedId,
      marketConfiguration.baseToken.bits
    );

    for (const [assetId, collateralConfiguration] of Object.entries(
      collateralConfigurations
    )) {
      assets.set(collateralConfiguration.price_feed_id, assetId);
    }

    return assets;
  }, [marketConfiguration, collateralConfigurations]);

  return useQuery({
    queryKey: ['pythPrices', priceFeedIdToAssetId, market],
    queryFn: async () => {
      if (
        !provider ||
        !priceFeedIdToAssetId ||
        !marketContract ||
        !pythContract
      )
        return null;

      const priceFeedIds = Array.from(priceFeedIdToAssetId.keys());

      // Fetch price updates from Hermes client
      const priceUpdates =
        await hermesClient.getLatestPriceUpdates(priceFeedIds);

      if (
        !priceUpdates ||
        !priceUpdates.parsed ||
        priceUpdates.parsed.length === 0
      ) {
        throw new Error('Failed to fetch price');
      }

      const buffer = Buffer.from(priceUpdates.binary.data[0], 'hex');
      const updateData = [arrayify(buffer)];

      const { value: fee } = await marketContract.functions
        .update_fee(updateData)
        .addContracts([pythContract])
        .get();

      // Prepare the PriceDateUpdateInput object
      const priceUpdateData: PriceDataUpdateInput = {
        update_fee: fee,
        publish_times: priceUpdates.parsed.map((parsedPrice) =>
          DateTime.fromUnixSeconds(parsedPrice.price.publish_time).toTai64()
        ),
        price_feed_ids: priceFeedIds,
        update_data: updateData,
      };

      // Format prices to BigNumber
      const prices = Object.fromEntries(
        priceUpdates.parsed.map((parsedPrice) => [
          priceFeedIdToAssetId.get(`0x${parsedPrice.id}`)!,
          BigNumber(parsedPrice.price.price).times(
            BigNumber(10).pow(BigNumber(parsedPrice.price.expo))
          ),
        ])
      );

      // Format confidence intervals to BigNumber
      const confidenceIntervals = Object.fromEntries(
        priceUpdates.parsed.map((parsedPrice) => [
          priceFeedIdToAssetId.get(`0x${parsedPrice.id}`)!,
          BigNumber(parsedPrice.price.conf).times(
            BigNumber(10).pow(BigNumber(parsedPrice.price.expo))
          ),
        ])
      );

      return {
        prices,
        confidenceIntervals,
        priceUpdateData,
      };
    },
    refetchInterval: 3000,
    enabled: !!provider && !!priceFeedIdToAssetId,
    staleTime: 3000,
    refetchOnWindowFocus: false,
  });
};
