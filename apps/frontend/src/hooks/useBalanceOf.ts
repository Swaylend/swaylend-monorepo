import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';

export const useBalanceOf = (marketContract: MarketAbi, assetId: string) => {
  const fetchBalanceOf = async (assetId: string) => {
    const { value } = await marketContract.functions.balance_of(assetId).get();
    if (!value) throw new Error('Failed to fetch balanceOf');
    return new BN(value.toString());
  };
  return useQuery({
    queryKey: ['balanceOf', assetId],
    queryFn: () => fetchBalanceOf(assetId),
  });
};
