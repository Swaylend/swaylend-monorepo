import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';
import { DEPLOYED_MARKETS, formatUnits } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketConfiguration } from './useMarketConfiguration';
import { useProvider } from './useProvider';

export const useMarketBalanceOfBase = () => {
  const provider = useProvider();
  const { market } = useMarketStore();
  const { data: marketConfiguration } = useMarketConfiguration();

  return useQuery({
    queryKey: ['marketBalanceOfBase', marketConfiguration?.baseToken, market],
    queryFn: async () => {
      if (!provider) return null;

      const marketContract = new Market(
        DEPLOYED_MARKETS[market].marketAddress,
        provider
      );

      const { value } = await marketContract.functions
        .balance_of(marketConfiguration?.baseToken!)
        .get();

      if (!value) throw new Error('Failed to fetch supplyRate');
      return {
        raw: BigNumber(value.toString()),
        formatted: formatUnits(
          BigNumber(value.toString()),
          marketConfiguration?.baseTokenDecimals
        ),
      };
    },
    enabled: !!provider && !!marketConfiguration,
  });
};
