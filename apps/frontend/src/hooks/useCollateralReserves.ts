import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';

import { appConfig } from '@/configs';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';

export const useCollateralReserves = (
  assetId: string,
  marketParam?: string
) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  return useQuery({
    queryKey: ['collateralReserves', market],
    queryFn: async () => {
      if (!provider || !assetId) return null;

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
        provider
      );

      const { value } = await marketContract.functions
        .get_collateral_reserves({ bits: assetId })
        .get();

      return BigNumber(value.underlying.toString()).minus(
        BigNumber(2).pow(255)
      );
    },
    enabled: !!provider,
    refetchOnWindowFocus: false,
  });
};
