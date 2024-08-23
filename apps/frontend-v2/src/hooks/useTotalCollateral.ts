import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES, collaterals } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';

export const useTotalCollateral = async () => {
  const provider = useProvider();

  const fetchTotalCollateral = async () => {
    if (!provider) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      provider
    );

    const functions = collaterals.map((b) =>
      marketContract.functions.totals_collateral(b.assetId).get()
    );

    const data = await Promise.all(functions);
    if (data.length > 0) {
      const v = data.reduce((acc: Record<string, BigNumber>, res, index) => {
        if (res == null) return acc;
        const assetId = collaterals[index].assetId;
        acc[assetId] = new BigNumber(res.value.toString());
        return acc;
      }, {});
      return v as Record<string, BigNumber>;
    }
    throw new Error('Failed to fetch totalsCollateral');
  };

  return useQuery({
    queryKey: ['totalCollateral'],
    queryFn: () => fetchTotalCollateral(),
    enabled: !!provider,
  });
};
