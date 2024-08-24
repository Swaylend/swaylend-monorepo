import { getCollateralAssets } from '@/lib/queries';
import { useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useUserCollateralAssets = () => {
  const { wallet } = useWallet();
  const fetchUserCollateralAssets = async () => {
    if (!wallet) return;

    const assets = await getCollateralAssets(wallet.address.toHexString());
    if (assets.length < 1) throw Error('Cant get user assets');
    const formattedCollaterals: Record<string, BigNumber> = {};
    assets[0].collateralAssets.forEach((asset) => {
      formattedCollaterals[asset.collateralAsset_id] = new BigNumber(
        asset.amount
      );
    });
    return formattedCollaterals;
  };
  return useQuery({
    queryKey: ['collateralAssets', wallet?.address.toHexString()],
    queryFn: () => fetchUserCollateralAssets(),
    enabled: !!wallet,
  });
};
