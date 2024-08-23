import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { BigNumberish } from 'fuels';
import { useProvider } from './useProvider';
import { useUtilization } from './useUtilization';

export const useBorrowRate = () => {
  const provider = useProvider();
  const { data: utilization } = useUtilization();

  const fetchBorrowRate = async (utilization: BigNumber) => {
    if (!provider) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      provider
    );
    const { value } = await marketContract.functions
      .get_borrow_rate(utilization as unknown as BigNumberish)
      .get();
    if (!value) throw new Error('Failed to fetch borrowRate');
    return new BigNumber(value.toString());
  };
  return useQuery({
    queryKey: ['borrowRate', utilization],
    queryFn: () => fetchBorrowRate(utilization as unknown as BigNumber),
    enabled: !!utilization,
  });
};
