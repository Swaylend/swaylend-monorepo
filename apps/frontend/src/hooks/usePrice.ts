import type { PriceDataUpdateInput } from '@/contract-types/Market';
import { selectMarket, useMarketStore } from '@/stores';

import { getStorkFeed } from '@/configs/storkFeeds';
import { useMarketContract } from '@/contracts/useMarketContract';
import { usePythContract } from '@/contracts/usePythContract';
import { encodeStorkUpdate, fetchStorkPrices, toPythPrice } from '@/lib/stork';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify } from 'fuels';
import { DateTime } from 'fuels';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useProvider } from './useProvider';

/**
 * Prices come from Stork, written on-chain through the stork-pyth-adapter.
 *
 * Pyth's Core upgrade (Aug 2026) put Hermes behind an API key and removed the
 * FUEL and ezETH feeds, so the market can no longer be priced from Pyth. The
 * adapter implements the Pyth ABI over Stork, which is why `usePythContract`
 * still works here - it just resolves to the adapter's contract id.
 *
 * Stork publishes no confidence interval, so the adapter synthesises one from a
 * per-feed basis-point spread; the same spread is applied here so the UI agrees
 * with what the contract computes.
 */
export const usePrice = (marketParam?: string) => {
  const { provider } = useProvider();

  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;

  const { data: marketConfiguration } = useMarketConfiguration(market);
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);

  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);

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

  const priceFeedIdToAssetIdKey = useMemo(
    () => Object.fromEntries(priceFeedIdToAssetId?.entries() ?? []),
    [priceFeedIdToAssetId]
  );

  return useQuery({
    queryKey: [
      'storkPrices',
      priceFeedIdToAssetIdKey,
      marketContract?.account?.address,
      marketContract?.id,
      pythContract?.account?.address,
      pythContract?.id,
    ],
    queryFn: async () => {
      if (!priceFeedIdToAssetId || !marketContract || !pythContract) {
        return null;
      }

      // Only request feeds Stork actually carries. Asking for an unknown asset
      // fails the whole request, which would take down pricing for every other
      // asset too.
      const feeds = Array.from(priceFeedIdToAssetId.keys())
        .map((priceFeedId) => {
          const feed = getStorkFeed(priceFeedId);
          return feed ? { priceFeedId, ...feed } : null;
        })
        .filter((f): f is NonNullable<typeof f> => f !== null);

      if (feeds.length === 0) {
        throw new Error('No Stork feeds configured for this market');
      }

      const storkPrices = await fetchStorkPrices(feeds.map((f) => f.asset));

      const prices: Record<string, BigNumber> = {};
      const confidenceIntervals: Record<string, BigNumber> = {};
      const updateData: Uint8Array[] = [];
      const publishTimes: string[] = [];
      const priceFeedIds: string[] = [];

      for (const feed of feeds) {
        const storkPrice = storkPrices.get(feed.asset);
        const assetId = priceFeedIdToAssetId.get(feed.priceFeedId);
        if (!storkPrice || !assetId) continue;

        const scaled = toPythPrice(storkPrice.quantizedValue, feed.exponent);
        const scale = BigNumber(10).pow(BigNumber(-feed.exponent));

        prices[assetId] = BigNumber(scaled.toString()).times(scale);
        confidenceIntervals[assetId] = BigNumber(
          ((scaled * BigInt(feed.confBps)) / 10000n).toString()
        ).times(scale);

        updateData.push(arrayify(encodeStorkUpdate(storkPrice)));
        publishTimes.push(
          DateTime.fromUnixSeconds(
            Number(storkPrice.timestampNs / 1_000_000_000n)
          ).toTai64()
        );
        priceFeedIds.push(feed.priceFeedId);
      }

      if (updateData.length === 0) {
        throw new Error('Failed to fetch price');
      }

      const { value: fee } = await marketContract.functions
        .update_fee(updateData)
        .get();

      const priceUpdateData: PriceDataUpdateInput = {
        update_fee: fee,
        publish_times: publishTimes,
        price_feed_ids: priceFeedIds,
        update_data: updateData,
      };

      return {
        prices,
        confidenceIntervals,
        priceUpdateData,
      };
    },
    refetchInterval: 5000,
    enabled:
      !!provider &&
      !!priceFeedIdToAssetId &&
      !!marketContract &&
      !!pythContract,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
};
