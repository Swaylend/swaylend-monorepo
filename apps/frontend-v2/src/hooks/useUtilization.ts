import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useUtilization = () => {
  const provider = useProvider();

  const fetchUtilization = async () => {
    if (!provider) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      provider
    );
    const { value } = await marketContract.functions.get_utilization().get();
    if (!value) throw new Error('Failed to fetch utilization');
    return value;
  };
  return useQuery({
    queryKey: ['utilization'],
    queryFn: fetchUtilization,
    enabled: !!provider,
  });
};
