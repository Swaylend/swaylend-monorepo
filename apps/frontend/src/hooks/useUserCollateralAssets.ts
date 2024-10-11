import { useMarketContract } from '@/contracts/useMarketContract';
import { selectMarket, useMarketStore } from '@/stores';
import { stringifySimpleRecord } from '@/utils/stringifySimpleRecord';
import { useAccount, useWallet } from '@fuels/react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useCollateralConfigurations } from './useCollateralConfigurations';

export const useUserCollateralAssets = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const market = useMarketStore(selectMarket);
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
      marketContract?.account?.address,
      marketContract?.id,
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
