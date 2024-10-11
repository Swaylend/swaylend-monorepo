import { useMarketContract } from '@/contracts/useMarketContract';
import { selectMarket, useMarketStore } from '@/stores';
import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';

export const useUserCollateralAssets = () => {
  const { account } = useAccount();
  const market = useMarketStore(selectMarket);
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'collateralAssets',
      account,
      collateralConfigurations,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!account || !collateralConfigurations || !marketContract) return null;

      const formattedCollaterals: Record<string, BigNumber> = {};

      const { value: balances } = await marketContract.functions
        .get_all_user_collateral({ Address: { bits: account } })
        .get();

      for (const [assetId, balance] of balances) {
        formattedCollaterals[assetId.bits] = new BigNumber(balance.toString());
      }

      return formattedCollaterals;
    },
    enabled: !!account && !!collateralConfigurations && !!marketContract,
  });
};
