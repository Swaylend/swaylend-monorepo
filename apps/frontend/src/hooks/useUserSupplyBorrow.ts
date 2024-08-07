import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';

export const useUserSupplyBorrow = (
  marketContract: MarketAbi,
  address: string
) => {
  const fetchUserSupplyBorrow = async (address: string) => {
    const { value } = await marketContract.functions
      .get_user_supply_borrow({ bits: address })
      .get();
    return [new BN(value[0].toString()), new BN(value[1].toString())];
  };

  return useQuery({
    queryKey: ['userSupplyBorrow', address],
    queryFn: () => fetchUserSupplyBorrow(address),
    enabled: address !== '',
  });
};
