import { Market, type PriceDataUpdateInput } from '@/contract-types/Market';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import { HermesClient } from '@pythnetwork/hermes-client';
import {
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
  PythContract,
} from '@pythnetwork/pyth-fuel-js';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify } from 'fuels';
import { DateTime } from 'fuels';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useProvider } from './useProvider';

export const usePrice = () => {
  const hermesClient = new HermesClient(
    process.env.NEXT_PUBLIC_HERMES_API ?? 'https://hermes.pyth.network'
  );
  const provider = useProvider();

  const { market } = useMarketStore();

  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: collateralConfigurations } = useCollateralConfigurations();

  // Create a map of priceFeedId to assetId
  const priceFeedIdToAssetId = useMemo(() => {
    if (!marketConfiguration || !collateralConfigurations) return null;

    const assets: Map<string, string> = new Map();

    assets.set(
      marketConfiguration.baseTokenPriceFeedId,
      marketConfiguration.baseToken
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
      if (!provider || !priceFeedIdToAssetId) return null;

      const priceFeedIds = Array.from(priceFeedIdToAssetId.keys());

      // Fetch price udpates from Hermes client
      const priceUpdates =
        await hermesClient.getLatestPriceUpdates(priceFeedIds);

      if (
        !priceUpdates ||
        !priceUpdates.parsed ||
        priceUpdates.parsed.length === 0
      ) {
        throw new Error('Failed to fetch price');
      }

      // Fetch updateFee
      const pythContract = new PythContract(
        PYTH_CONTRACT_ADDRESS_SEPOLIA,
        provider
      );

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

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

      return {
        prices,
        priceUpdateData,
      };
    },
    refetchInterval: 10000,
    enabled: !!provider && !!priceFeedIdToAssetId,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};
