import type { MarketAbi } from '@src/contract-types';
import { useQuery } from '@tanstack/react-query';

export const useReserves = (marketContract: MarketAbi) => {
  const fetchReserves = async () => {
    const { value } = await marketContract.functions.get_reserves().get();
    if (!value) throw new Error('Failed to fetch totalLiquidity');
    return value;
  };
  return useQuery({
    queryKey: ['reserves'],
    queryFn: fetchReserves,
  });
};
