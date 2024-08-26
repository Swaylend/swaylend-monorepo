import { HermesClient } from '@pythnetwork/hermes-client';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

const PRICE_FEEDS = {
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': {
    symbol: 'Crypto.ETH/USD',
    id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  },
  '0xc09edcb7cce3902a392d7845b5cca7b100dcabf6067c0c4f42f2d75c46e98c99': {
    symbol: 'Crypto.BTC/USD',
    id: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  },
  '0xfd0c9669e733932810b34b6f2e5910daf36d8680069b7ed0ce0a69120b5f11c5': {
    symbol: 'Crypto.USDC/USD',
    id: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
  '0x3fa0c42a7f6cdf27bb0b6bbde20011e0e53155437b3da5773d92649a5f9f84af': {
    symbol: 'Crypto.UNI/USD',
    id: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
  },
} as Record<string, any>;

const PRICE_FEEDS_BY_PRICE_FEED_ID = {
  ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace: {
    symbol: 'Crypto.ETH/USD',
    assetId:
      '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
  },
  e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43: {
    symbol: 'Crypto.BTC/USD',
    assetId:
      '0xc09edcb7cce3902a392d7845b5cca7b100dcabf6067c0c4f42f2d75c46e98c99',
  },
  eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a: {
    symbol: 'Crypto.USDC/USD',
    assetId:
      '0xfd0c9669e733932810b34b6f2e5910daf36d8680069b7ed0ce0a69120b5f11c5',
  },
  '78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501': {
    symbol: 'Crypto.UNI/USD',
    assetId:
      '0x3fa0c42a7f6cdf27bb0b6bbde20011e0e53155437b3da5773d92649a5f9f84af',
  },
} as Record<string, any>;

export const usePrice = (assetIds: string[]) => {
  const hermesClient = new HermesClient('https://hermes.pyth.network');

  const fetchPrice = async (assetIds: string[]) => {
    const priceUpdates = await hermesClient.getLatestPriceUpdates(
      assetIds.map((assetId) => PRICE_FEEDS[assetId].id)
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
      const currentAssetId = PRICE_FEEDS_BY_PRICE_FEED_ID[current.id].assetId;
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
