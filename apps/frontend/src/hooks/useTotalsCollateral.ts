import type { IToken } from '@src/constants';
import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useTotalsCollateral = (
  marketContract: MarketAbi,
  collaterals: IToken[]
) => {
  const fetchTotalsCollateral = async (collaterals: IToken[]) => {
    const functions = collaterals.map((b) =>
      marketContract.functions.totals_collateral(b.assetId).get()
    );

    const data = await Promise.all(functions);
    if (data.length > 0) {
      const v = data.reduce((acc, res, index) => {
        if (res == null) return acc;
        const assetId = collaterals[index].assetId;
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        return { ...acc, [assetId]: new BN(res.value.toString()) };
      }, {});
      return v as Record<string, BN>;
    }
    throw new Error('Failed to fetch totalsCollateral');
  };

  return useQuery({
    queryKey: ['totalsCollateral'],
    queryFn: () => fetchTotalsCollateral(collaterals),
  });
};
