import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { BigNumberish } from 'fuels';
import { useUtilization } from './useUtilization';
import { useWalletToRead } from './useWalletToRead';

export const useSupplyRate = () => {
  const wallet = useWalletToRead();
  const { data: utilization } = useUtilization();

  const fetchSupplyRate = async (utilization: BigNumber) => {
    if (!wallet) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      wallet
    );
    const { value } = await marketContract.functions
      .get_supply_rate(utilization as unknown as BigNumberish)
      .get();
    if (!value) throw new Error('Failed to fetch supplyRate');
    return new BigNumber(value.toString());
  };
  return useQuery({
    queryKey: ['supplyRate'],
    queryFn: () => fetchSupplyRate(utilization as unknown as BigNumber),
    enabled: !!utilization,
  });
};
