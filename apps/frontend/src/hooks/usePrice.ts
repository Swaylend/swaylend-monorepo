import { selectMarket, useMarketStore } from '@/stores';

import { useQuery } from '@tanstack/react-query';
import { usePythPrice } from './usePythPrice';
import { useRedstonePrice } from './useRedstonePrice';
import BigNumber from 'bignumber.js';

type PriceResolutionMethod = 'high' | 'low' | 'avg';

const priceResolutionFunction = (
  map1?: Record<string, BigNumber>,
  map2?: Record<string, BigNumber>,
  mode: PriceResolutionMethod = 'avg'
): Record<string, BigNumber> | null => {
  if (!map1) return map2 || null;
  if (!map2) return map1;
  const resultMap: Record<string, BigNumber> = {};

  const allKeys = new Set([...Object.keys(map1), ...Object.keys(map2)]);

  const resolutionFunctions: Record<
    PriceResolutionMethod,
    (a: BigNumber, b: BigNumber) => BigNumber
  > = {
    high: BigNumber.maximum,
    low: BigNumber.minimum,
    avg: (a, b) => a.plus(b).div(2),
  };

  allKeys.forEach((key) => {
    const value1 = map1[key] || new BigNumber(0);
    const value2 = map2[key] || new BigNumber(0);
    resultMap[key] = resolutionFunctions[mode](value1, value2);
  });

  return resultMap;
};

export const usePrice = (
  marketParam?: string,
  priceResolution: PriceResolutionMethod = 'avg',
  oracle: 'pyth' | 'redstone' | undefined = 'pyth'
) => {
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;

  const { data: pythPrices } = usePythPrice(market);
  const { data: redstonePrices } = useRedstonePrice(market);

  return useQuery({
    queryKey: [
      'oraclePrices',
      pythPrices?.prices,
      pythPrices?.priceUpdateData,
      pythPrices?.confidenceIntervals,
      redstonePrices?.prices,
      redstonePrices?.priceUpdateData,
    ],
    queryFn: async () => {
      if (!pythPrices && !redstonePrices) {
        throw new Error('Failed to fetch price');
      }

      if (oracle === 'pyth' && pythPrices)
        return {
          prices: pythPrices.prices,
          confidenceIntervals: pythPrices.confidenceIntervals,
          pythPriceUpdateData: pythPrices.priceUpdateData,
          redstonePriceUpdateData: redstonePrices?.priceUpdateData,
        };

      if (oracle === 'redstone' && redstonePrices)
        return {
          prices: redstonePrices.prices,
          confidenceIntervals: pythPrices?.confidenceIntervals,
          pythPriceUpdateData: pythPrices?.priceUpdateData,
          redstonePriceUpdateData: redstonePrices.priceUpdateData,
        };
      const combinedPrices = priceResolutionFunction(
        pythPrices?.prices,
        redstonePrices?.prices,
        priceResolution
      );

      if (!combinedPrices) return null;

      return {
        prices: combinedPrices,
        confidenceIntervals: pythPrices?.confidenceIntervals,
        pythPriceUpdateData: pythPrices?.priceUpdateData,
        redstonePriceUpdateData: redstonePrices?.priceUpdateData,
      };
    },
    enabled: !!pythPrices && !!redstonePrices,
  });
};
