import { Market, type PriceDataUpdateInput } from '@/contract-types/Market';
import {
  DEPLOYED_MARKETS,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_PRICE_FEED,
} from '@/utils';
import { HermesClient } from '@pythnetwork/hermes-client';
import {
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
  PythContract,
} from '@pythnetwork/pyth-fuel-js';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { arrayify } from 'fuels';
import { useProvider } from './useProvider';
import { useMarketStore } from '@/stores';

export const usePrice = (assetIds: string[]) => {
  const hermesClient = new HermesClient('https://hermes.pyth.network');
  const { market } = useMarketStore();
  const provider = useProvider();

  return useQuery({
    queryKey: ['pythPrices', assetIds, market],
    queryFn: async () => {
      if (!provider) return;

      const priceFeedIds = assetIds.map(
        (assetId) => TOKENS_BY_ASSET_ID[assetId].priceFeed
      );

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
        publish_times: priceUpdates.parsed.map(
          (parsedPrice) => parsedPrice.price.publish_time
        ),
        price_feed_ids: priceFeedIds,
        update_data: updateData,
      };

      // Format prices to BigNumber
      const prices: Record<string, BigNumber> = {};

      priceUpdates.parsed.forEach((parsedPrice) => {
        const currentAssetId = TOKENS_BY_PRICE_FEED[parsedPrice.id].assetId;
        prices[currentAssetId] = BigNumber(parsedPrice.price.price).times(
          BigNumber(10).pow(BigNumber(parsedPrice.price.expo))
        );
      });

      return {
        prices,
        priceUpdateData,
      };
    },
    refetchInterval: 5000,
    enabled: !!provider,
  });
};
