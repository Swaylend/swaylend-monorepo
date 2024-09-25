import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';

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

      const { value: balances } = await marketContract.functions
        .get_all_user_collateral({ Address: { bits: account } })
        .get();

      for (const [assetId, balance] of balances) {
        formattedCollaterals[assetId.bits] = new BigNumber(balance.toString());
      }

      return formattedCollaterals;
    },
    enabled: !!account && !!wallet && !!collateralConfigurations,
  });
};
