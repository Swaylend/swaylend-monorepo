import { appConfig } from '@/configs';
import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useUserSupplyBorrow = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();

  return useQuery({
    queryKey: ['userSupplyBorrow', account, market],
    queryFn: async () => {
      if (!wallet || !account) return null;

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
        wallet
      );

      const { value } = await marketContract.functions
        .get_user_supply_borrow({ Address: { bits: account } })
        .get();

      return {
        supplied: new BigNumber(value[0].toString()),
        borrowed: new BigNumber(value[1].toString()),
      };
    },
    enabled: !!wallet && !!account,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
