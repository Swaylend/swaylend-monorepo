import { HermesClient, type PriceUpdate } from '@pythnetwork/hermes-client';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify, DateTime } from 'fuels';
import { useMemo, useState } from 'react';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { usePythContract } from '@/contracts/v2/use-pyth-contract';
import { useMarketStore } from '@/stores/market-store';
import { useProvider } from '../../use-provider';
import { useCollateralConfigurations } from '../use-collateral-configurations';
import { useMarketConfiguration } from '../use-market-configuration';

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

  const { data: marketConfiguration } = useMarketConfiguration(market);
  const { data: collateralConfigurations } =
    useCollateralConfigurations(market);

  const marketContract = useMarketContract(market);
  const pythContract = usePythContract(market);

  // Create a map of priceFeedId to assetId
  const priceFeedIdToAssetId = useMemo(() => {
    if (!(marketConfiguration && collateralConfigurations)) return null;

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
      'pythPrices',
      'v2',
      priceFeedIdToAssetIdKey,
      marketContract?.account?.address,
      marketContract?.id,
      pythContract?.account?.address,
      pythContract?.id,
    ],
    queryFn: async () => {
      if (!(priceFeedIdToAssetId && marketContract && pythContract)) {
        return null;
      }

      const priceFeedIds = Array.from(priceFeedIdToAssetId.keys());

      // Fetch price updates from Hermes client
      let priceUpdates: PriceUpdate | null = null;
      try {
        priceUpdates = await hermesClient.getLatestPriceUpdates(priceFeedIds);
      } catch (_error) {
        const client = new HermesClient('https://hermes.pyth.network');

        priceUpdates = await client.getLatestPriceUpdates(priceFeedIds);
      }

      if (!priceUpdates?.parsed || priceUpdates.parsed.length === 0) {
        throw new Error('Failed to fetch price');
      }

      const buffer = Buffer.from(priceUpdates.binary.data[0], 'hex');
      const updateData = [arrayify(buffer)];

      const { value: fee } = await marketContract.functions
        .update_fee(updateData)
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
