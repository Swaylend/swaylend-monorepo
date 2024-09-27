import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useProvider } from './useProvider';

export const useTotalReserves = (
  assetId: string,
  marketParam?: DeployedMarket
) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  return useQuery({
    queryKey: ['totalReserves', market],
    queryFn: async () => {
      if (!provider || !assetId) return BigNumber(0);

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const { value } = await marketContract.functions.get_reserves().get();
      return BigNumber(value.value.toString());
    },
    refetchOnWindowFocus: false,
    enabled: !!provider,
  });
};
