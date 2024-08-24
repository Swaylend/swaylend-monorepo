import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { BN } from 'fuels';
import { useProvider } from './useProvider';
import { useUtilization } from './useUtilization';

export const useSupplyRate = () => {
  const provider = useProvider();
  const { data: utilization } = useUtilization();

  const fetchSupplyRate = async (utilization: BN | undefined) => {
    if (!provider || !utilization) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      provider
    );
    const { value } = await marketContract.functions
      .get_supply_rate(utilization)
      .get();
    if (!value) throw new Error('Failed to fetch supplyRate');
    return new BigNumber(value.toString());
  };
  return useQuery({
    queryKey: ['supplyRate', utilization],
    queryFn: () => fetchSupplyRate(utilization),
    enabled: !!utilization,
  });
};
