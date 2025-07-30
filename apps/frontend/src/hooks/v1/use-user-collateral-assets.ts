import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketContract } from '@/contracts/use-market-contract';
import { useMarketStore } from '@/stores/market-store';
import { useCollateralConfigurations } from './use-collateral-configurations';

export const useUserCollateralAssets = (marketParam?: string) => {
  const { account } = useAccount();
  const market = marketParam || useMarketStore.use.market();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'collateralAssets',
      account,
      marketContract?.account?.address,
      marketContract?.id,
      collateralConfigurations,
    ],
    queryFn: async () => {
      if (!(account && collateralConfigurations && marketContract)) return null;

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
