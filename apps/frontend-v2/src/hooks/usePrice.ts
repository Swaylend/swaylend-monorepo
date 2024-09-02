import { TOKENS_BY_ASSET_ID, TOKENS_BY_PRICE_FEED } from '@/utils';
import { HermesClient } from '@pythnetwork/hermes-client';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const usePrice = (assetIds: string[]) => {
  const hermesClient = new HermesClient('https://hermes.pyth.network');

  const fetchPrice = async (assetIds: string[]) => {
    const priceUpdates = await hermesClient.getLatestPriceUpdates(
      assetIds.map((assetId) => TOKENS_BY_ASSET_ID[assetId].priceFeed)
    );
    if (
      !priceUpdates ||
      !priceUpdates.parsed ||
      priceUpdates.parsed.length === 0
    ) {
      throw new Error('Failed to fetch price');
    }
    const previousPrices: Record<string, BigNumber> = {};
    priceUpdates.parsed.forEach((current) => {
      const currentAssetId = TOKENS_BY_PRICE_FEED[current.id].assetId;
      previousPrices[currentAssetId] = BigNumber(current.price.price).times(
        BigNumber(10).pow(BigNumber(current.price.expo))
      );
    });
    return previousPrices;
  };
  return useQuery({
    queryKey: ['priceOf', assetIds],
    queryFn: () => fetchPrice(assetIds),
  });
};
