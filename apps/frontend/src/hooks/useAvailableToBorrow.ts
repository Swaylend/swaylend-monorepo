import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';
import type { Contract } from 'fuels';
import { useMemo } from 'react';

export const useAvailableToBorrow = (
  marketContract: MarketAbi,
  oracle: Contract | null,
  address: string | null
) => {
  const fetchAvailableToBorrow = async (oracle: Contract, address: string) => {
    const { value } = await marketContract.functions
      .available_to_borrow({ bits: address })
      .addContracts([oracle])
      .get();
    return value;
  };
  const { data, refetch, isSuccess } = useQuery({
    queryKey: ['availableToBorrow', address],
    queryFn: () =>
      fetchAvailableToBorrow(oracle as Contract, address as string),
    enabled: !!oracle && !!address,
  });

  const newData = useMemo(() => {
    if (!data) return null;
    return new BN(data.toString());
  }, [data]);

  return { data: newData, refetch, isSuccess };
};
