import { MarketAbi__factory } from '@/contract-types';
import { CONTRACT_ADDRESSES, collaterals } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useWalletToRead } from './useWalletToRead';

export const useTotalCollateral = () => {
  const wallet = useWalletToRead();

  const fetchTotalCollateral = async () => {
    if (!wallet) return;
    const marketContract = MarketAbi__factory.connect(
      CONTRACT_ADDRESSES.market,
      wallet
    );

    const functions = collaterals.map((b) =>
      marketContract.functions.totals_collateral(b.assetId).get()
    );

    const data = await Promise.all(functions);
    if (data.length > 0) {
      const v = data.reduce((acc, res, index) => {
        if (res == null) return acc;
        const assetId = collaterals[index].assetId;
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        return { ...acc, [assetId]: new BigNumber(res.value.toString()) };
      }, {});
      return v as Record<string, BigNumber>;
    }
    throw new Error('Failed to fetch totalsCollateral');
  };

  return useQuery({
    queryKey: ['totalCollateral'],
    queryFn: () => fetchTotalCollateral(),
    enabled: !!wallet,
  });
};
