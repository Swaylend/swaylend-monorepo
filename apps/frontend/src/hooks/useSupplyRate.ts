import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';
import type { BigNumberish } from 'fuels';
import { useMemo } from 'react';
import { useUtilization } from './useUtilization';

export const useSupplyRate = (marketContract: MarketAbi) => {
  const { data: utilization } = useUtilization(marketContract);

  const fetchSupplyRate = async (utilization: BN) => {
    const { value } = await marketContract.functions
      .get_supply_rate(utilization as unknown as BigNumberish)
      .get();
    if (!value) throw new Error('Failed to fetch supplyRate');
    return new BN(value.toString());
  };
  return useQuery({
    queryKey: ['supplyRate'],
    queryFn: () => fetchSupplyRate(utilization as unknown as BN),
    enabled: !!utilization,
  });
};
