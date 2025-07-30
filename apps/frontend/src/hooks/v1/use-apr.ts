import { keepPreviousData, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useMarketStore } from '@/stores/market-store';
import { useBorrowRate } from './use-borrow-rate';
import { useRewards } from './use-rewards';
import { useSupplyRate } from './use-supply-rate';

const COEFFICIENT = BigNumber(365).times(24).times(60).times(60);

export const useApr = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const { data: rewardsData } = useRewards(market);
  const { data: supplyRate } = useSupplyRate(market);
  const { data: borrowRate } = useBorrowRate(market);

  return useQuery({
    queryKey: ['apr', 'v1', supplyRate, borrowRate, rewardsData],
    queryFn: () => {
      if (!(supplyRate && borrowRate && rewardsData)) {
        return {
          supplyBaseApr: BigNumber(0),
          borrowBaseApr: BigNumber(0),
          supplyRewardApr: BigNumber(0),
          borrowRewardApr: BigNumber(0),
          netSupplyApr: BigNumber(0),
          netBorrowApr: BigNumber(0),
        };
      }

      const { borrowRewardApr, supplyRewardApr } = rewardsData;

      const supplyBaseApr = supplyRate
        .times(COEFFICIENT)
        .dividedBy(BigNumber(10).pow(18));
      const borrowBaseApr = borrowRate
        .times(COEFFICIENT)
        .dividedBy(BigNumber(10).pow(18));

      const netSupplyApr = supplyBaseApr.plus(supplyRewardApr);
      const netBorrowApr = borrowBaseApr.minus(borrowRewardApr);

      return {
        supplyBaseApr,
        borrowBaseApr,
        supplyRewardApr,
        borrowRewardApr,
        netSupplyApr,
        netBorrowApr,
      };
    },
    enabled: !!supplyRate && !!borrowRate && !!rewardsData,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
