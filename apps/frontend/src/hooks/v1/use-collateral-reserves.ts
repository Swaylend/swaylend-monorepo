import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketContract } from '@/contracts/v1/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useCollateralReserves = (
  assetId: string,
  marketParam?: string
) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'collateralReserves',
      'v1',
      marketContract?.account?.address,
      marketContract?.id,
      assetId,
    ],
    queryFn: async () => {
      if (!(assetId && marketContract)) return null;

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
