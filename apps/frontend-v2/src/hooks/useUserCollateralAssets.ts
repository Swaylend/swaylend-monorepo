import { useMarketStore } from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { Market } from '@/contract-types';
import { DEPLOYED_MARKETS } from '@/utils';

export const useUserCollateralAssets = () => {
  const { wallet } = useWallet();

  const { account } = useAccount();
  const { market } = useMarketStore();
  const { data: collateralConfigurations } = useCollateralConfigurations();

  return useQuery({
    queryKey: ['collateralAssets', account, market, collateralConfigurations],
    queryFn: async () => {
      if (!account || !collateralConfigurations || !wallet) return null;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        wallet
      );

      const formattedCollaterals: Record<string, BigNumber> = {};

      const getAllUserCollateralResult = await marketContract.functions
        .get_all_user_collateral({ bits: account })
        .get();

      const balances = getAllUserCollateralResult.value;

      for (const [assetId, balance] of balances) {
        formattedCollaterals[assetId] = new BigNumber(balance.toString());
      }

      return formattedCollaterals;
    },
    enabled: !!account,
  });
};
