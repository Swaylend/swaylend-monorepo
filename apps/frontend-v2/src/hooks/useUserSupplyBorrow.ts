import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useUserSupplyBorrow = () => {
  const { wallet } = useWallet();

  const fetchUserSupplyBorrow = async () => {
    if (!wallet) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      wallet
    );

    const { value } = await marketContract.functions
      .get_user_supply_borrow({ bits: wallet.address.toB256() })
      .get();
    return [
      new BigNumber(value[0].toString()),
      new BigNumber(value[1].toString()),
    ];
  };

  return useQuery({
    queryKey: ['userSupplyBorrow', wallet?.address.toHexString()],
    queryFn: () => fetchUserSupplyBorrow(),
    enabled: !!wallet,
  });
};
