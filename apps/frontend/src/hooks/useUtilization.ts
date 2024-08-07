import type { MarketAbi } from '@src/contract-types';
import { useQuery } from '@tanstack/react-query';

export const useUtilization = (marketContract: MarketAbi) => {
  const fetchUtilization = async () => {
    const { value } = await marketContract.functions.get_utilization().get();
    if (!value) throw new Error('Failed to fetch utilization');
    return value;
  };
  return useQuery({
    queryKey: ['utilization'],
    queryFn: fetchUtilization,
  });
};
