import { useMarketContract } from '@/contracts/useMarketContract';
import { selectMarket, useMarketStore } from '@/stores';
import { useAccount } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useUserSupplyBorrow = () => {
  const { account } = useAccount();
  const market = useMarketStore(selectMarket);

  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'userSupplyBorrow',
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
