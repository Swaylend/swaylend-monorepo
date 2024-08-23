import { HermesClient } from '@pythnetwork/hermes-client';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

const PRICE_FEEDS = {
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': {
    symbol: 'Crypto.ETH/USD',
    id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  },
  '0x00dc5cda67b6a53b60fa53f95570fdaabb5b916c0e6d614a3f5d9de68f832e61': {
    symbol: 'Crypto.BTC/USD',
    id: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  },
  '0xb5a7ec61506d83f6e4739be2dc57018898b1e08684c097c73b582c9583e191e2': {
    symbol: 'Crypto.USDC/USD',
    id: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
  '0xf7c5f807c40573b5db88e467eb9aabc42332483493f7697442e1edbd59e020ad': {
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
      '0x00dc5cda67b6a53b60fa53f95570fdaabb5b916c0e6d614a3f5d9de68f832e61',
  },
  eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a: {
    symbol: 'Crypto.USDC/USD',
    assetId:
      '0xb5a7ec61506d83f6e4739be2dc57018898b1e08684c097c73b582c9583e191e2',
  },
  '78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501': {
    symbol: 'Crypto.UNI/USD',
    assetId:
      '0xf7c5f807c40573b5db88e467eb9aabc42332483493f7697442e1edbd59e020ad',
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
    )
      throw new Error('Failed to fetch price');
    const previousPrices: Record<string, BigNumber> = {};
    priceUpdates.parsed.forEach((current) => {
      const currentAssetId = PRICE_FEEDS_BY_PRICE_FEED_ID[current.id].assetId;
      const currentPreviousPrice =
        Number(current.price.price) * 10 ** Number(current.price.expo);
      previousPrices[currentAssetId] = BigNumber(currentPreviousPrice);
    });
    return previousPrices;
  };
  return useQuery({
    queryKey: ['priceOf', assetIds],
    queryFn: () => fetchPrice(assetIds),
  });

  // const data = results.reduce((acc: Record<string, BigNumber>, res, index) => {
  //   if (!res.data) return acc;
  //   acc[assetIds[index]] = res.data;
  //   return acc;
  // }, {}) as Record<string, BigNumber>;

  // const refetch = () => {
  //   results.forEach((res) => res.refetch());
  // };

  // const getPrice = (assetId: string) => {
  //   return data[assetId] ?? new BigNumber(0);
  // };

  // const getFormattedPrice = (assetId: string): string => {
  //   if (!data[assetId]) return '$ 0.00';
  //   const price = data[assetId];
  //   return `$${toFixed(price.toString(), { precision: 2 })}`;
  // };

  // return {
  //   data,
  //   isLoading: results.some((res) => res.isLoading),
  //   isError: results.some((res) => res.isError),
  //   refetch,
  //   getPrice,
  //   getFormattedPrice,
  // };
};
