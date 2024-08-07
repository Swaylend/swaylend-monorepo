import type { IToken } from '@src/constants';
import type { MarketAbi } from '@src/contract-types';
import BN from '@src/utils/BN';
import { useQuery } from '@tanstack/react-query';

export const useUserCollateral = (
  marketContract: MarketAbi,
  collaterals: IToken[],
  address: string | null
) => {
  const fetchUserCollateral = async (
    collaterals: IToken[],
    address: string
  ) => {
    const functions = collaterals.map((b) =>
      marketContract.functions
        .get_user_collateral({ bits: address }, b.assetId)
        .get()
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

    throw new Error('Failed to fetch userCollateral');
  };

  return useQuery({
    queryKey: ['userCollateral', address],
    queryFn: () => fetchUserCollateral(collaterals, address as string),
    enabled: !!address,
  });
};
