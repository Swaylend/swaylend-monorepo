import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';
import type { BigNumberish } from 'fuels';
import { useUtilization } from './useUtilization';

export const useBorrowRate = (marketContract: MarketAbi) => {
  const { data: utilization } = useUtilization(marketContract);

  const fetchBorrowRate = async (utilization: BN) => {
    const { value } = await marketContract.functions
      .get_borrow_rate(utilization as unknown as BigNumberish)
      .get();
    if (!value) throw new Error('Failed to fetch borrowRate');
    return new BN(value.toString());
  };
  return useQuery({
    queryKey: ['borrowRate'],
    queryFn: () => fetchBorrowRate(utilization as unknown as BN),
    enabled: !!utilization,
  });
};
