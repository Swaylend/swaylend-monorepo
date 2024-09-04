import { getCollateralAssets } from '@/lib/queries';
import { useMarketStore } from '@/stores';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useUserCollateralAssets = () => {
  const { account } = useAccount();
  const { market } = useMarketStore();

  return useQuery({
    queryKey: ['collateralAssets', account, market],
    queryFn: async () => {
      if (!account) return null;

      const assets = await getCollateralAssets(account, market);

      const formattedCollaterals: Record<string, BigNumber> = {};

      if (assets.length > 0) {
        assets[0].collateralAssets.forEach((asset) => {
          formattedCollaterals[asset.collateralAsset_id] = new BigNumber(
            asset.amount
          );
        });
      }

      return formattedCollaterals;
    },
    enabled: !!account,
  });
};
