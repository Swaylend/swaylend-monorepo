import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useWalletToRead } from './useWalletToRead';

export const useUtilization = () => {
  const wallet = useWalletToRead();

  const fetchUtilization = async () => {
    if (!wallet) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      wallet
    );
    const { value } = await marketContract.functions.get_utilization().get();
    if (!value) throw new Error('Failed to fetch utilization');
    return value;
  };
  return useQuery({
    queryKey: ['utilization'],
    queryFn: fetchUtilization,
    enabled: !!wallet,
  });
};
