import { getCollateralAssets } from '@/lib/queries';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useUserCollateralAssets = () => {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['collateralAssets', account],
    queryFn: async () => {
      if (!account) return;

      const assets = await getCollateralAssets(account);
      if (assets.length < 1) throw Error('Cant get user assets');

      const formattedCollaterals: Record<string, BigNumber> = {};
      assets[0].collateralAssets.forEach((asset) => {
        formattedCollaterals[asset.collateralAsset_id] = new BigNumber(
          asset.amount
        );
      });

      return formattedCollaterals;
    },
    enabled: !!account,
  });
};
