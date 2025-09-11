import { useAccount } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { useMarketStore } from '@/stores/market-store';
import { createStableHash } from '@/utils';
import { useCollateralConfigurations } from './use-collateral-configurations';

export const useUserCollateralAssets = (marketParam?: string) => {
  const { account } = useAccount();
  const market = marketParam || useMarketStore.use.market();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'collateralAssets',
      'v1',
      account,
      marketContract?.id,
      createStableHash(collateralConfigurations),
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
