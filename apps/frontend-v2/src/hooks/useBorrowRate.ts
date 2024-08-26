import { Market } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { BN } from 'fuels';
import { useProvider } from './useProvider';
import { useUtilization } from './useUtilization';

export const useBorrowRate = () => {
  const provider = useProvider();
  const { data: utilization } = useUtilization();

  const fetchBorrowRate = async (utilization: BN | undefined) => {
    if (!provider || !utilization) return;
    const marketContract = new Market(CONTRACT_ADDRESSES.market, provider);
    const { value } = await marketContract.functions
      .get_borrow_rate(utilization)
      .get();
    if (!value) throw new Error('Failed to fetch borrowRate');
    return new BigNumber(value.toString());
  };
  return useQuery({
    queryKey: ['borrowRate', utilization],
    queryFn: () => fetchBorrowRate(utilization),
    enabled: !!utilization,
  });
};
