import { formatUnits } from '@/utils';
import BigNumber from 'bignumber.js';
import { useMarketBasics } from './useMarketBasics';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useQuery } from '@tanstack/react-query';
import { useMarketStore } from '@/stores';
import { useTotalReserves } from './useTotalReserves';

export const useMarketBalanceOfBase = (marketParam?: string) => {
  const { data: marketBasics } = useMarketBasics(marketParam);
  const { data: marketConfiguration } = useMarketConfiguration(marketParam);
  const { data: totalReserves } = useTotalReserves(marketParam);
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  return useQuery({
    queryKey: ['marketBalanceOfBase', market],
    queryFn: async () => {
      if (!marketBasics || !marketConfiguration || !totalReserves) {
        return {
          raw: BigNumber(0),
          formatted: BigNumber(0),
        };
      }

      const balanceOfBase = BigNumber(marketBasics.total_supply_base.toString())
        .minus(BigNumber(marketBasics.total_borrow_base.toString()))
        .plus(totalReserves);

      return {
        raw: balanceOfBase,
        formatted: formatUnits(
          balanceOfBase,
          marketConfiguration.baseTokenDecimals
        ),
      };
    },
    refetchOnWindowFocus: false,
    enabled: !!marketBasics && !!marketConfiguration && !!totalReserves,
  });
};
