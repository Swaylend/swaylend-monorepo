import { useMarketStore } from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useCollateralConfigurations } from './useCollateralConfigurations';
import { useMarketContract } from '@/contracts/useMarketContract';
import { useMemo } from 'react';
import { stringifySimpleRecord } from '@/utils/stringifySimpleRecord';

export const useUserCollateralAssets = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { market } = useMarketStore();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const marketContract = useMarketContract();

  const collateralConfigurationsKey = useMemo(
    () => stringifySimpleRecord(collateralConfigurations),
    [collateralConfigurations]
  );

  return useQuery({
    queryKey: [
      'collateralAssets',
      account,
      market,
      collateralConfigurationsKey,
    ],
    queryFn: async () => {
      if (!account || !collateralConfigurations || !wallet || !marketContract)
        return null;

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
