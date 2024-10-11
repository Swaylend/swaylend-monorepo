import { selectMarket, useMarketStore } from '@/stores';

import { useMarketContract } from '@/contracts/useMarketContract';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useCollateralReserves = (
  assetId: string,
  marketParam?: string
) => {
  const storeMarket = useMarketStore(selectMarket);
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'collateralReserves',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!assetId || !marketContract) return null;

      const { value } = await marketContract.functions
        .get_collateral_reserves({ bits: assetId })
        .get();

      return BigNumber(value.underlying.toString()).minus(
        BigNumber(2).pow(255)
      );
    },
    enabled: !!marketContract,
    refetchOnWindowFocus: false,
  });
};
