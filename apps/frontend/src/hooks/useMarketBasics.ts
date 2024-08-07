import type { MarketAbi } from '@src/contract-types';
import { useQuery } from '@tanstack/react-query';

export const useMarketBasics = (marketContract: MarketAbi) => {
  const fetchMarketBasics = async () => {
    const result = await marketContract.functions.get_market_basics().get();
    if (!result || !result.value)
      throw new Error('Failed to fetch market basics');
    return result.value;
  };
  return useQuery({
    queryKey: ['marketBasics'],
    queryFn: fetchMarketBasics,
  });
};
