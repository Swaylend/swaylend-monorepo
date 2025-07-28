import { useMarketStore } from '@/stores';
import { formatUnits } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketBasics } from './useMarketBasics';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useTotalReserves } from './useTotalReserves';

export const useMarketBalanceOfBase = (marketParam?: string) => {
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  const { data: marketBasics } = useMarketBasics(market);
  const { data: marketConfiguration } = useMarketConfiguration(market);
  const { data: totalReserves } = useTotalReserves(market);

  return useQuery({
    queryKey: [
      'marketBalanceOfBase',
      market,
      marketBasics,
      marketConfiguration,
      totalReserves,
    ],
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
