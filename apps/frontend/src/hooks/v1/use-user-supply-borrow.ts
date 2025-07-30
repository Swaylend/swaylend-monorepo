import { useAccount } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useUserSupplyBorrow = (marketParam?: string) => {
  const { account } = useAccount();
  const market = marketParam || useMarketStore.use.market();

  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'userSupplyBorrow',
      'v1',
      account,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!account) {
        return {
          supplied: new BigNumber(0),
          borrowed: new BigNumber(0),
        };
      }

      if (!marketContract) return null;

      const { value } = await marketContract.functions
        .get_user_supply_borrow({ Address: { bits: account } })
        .get();

      return {
        supplied: new BigNumber(value[0].toString()),
        borrowed: new BigNumber(value[1].toString()),
      };
    },
    enabled: !!marketContract,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
