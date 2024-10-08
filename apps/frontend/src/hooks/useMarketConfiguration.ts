import { Market } from '@/contract-types';
import { useMarketStore } from '@/stores';

import { appConfig } from '@/configs';
import { useQuery } from '@tanstack/react-query';
import { useProvider } from './useProvider';

export const useMarketConfiguration = (marketParam?: string) => {
  const provider = useProvider();
  const { market: storeMarket } = useMarketStore();
  const market = marketParam ?? storeMarket;

  return useQuery({
    queryKey: ['marketConfiguration', market],
    queryFn: async () => {
      if (!provider) return null;

      const marketContract = new Market(
        appConfig.markets[market].marketAddress,
        provider
      );

      const { value: marketConfiguration } = await marketContract.functions
        .get_market_configuration()
        .get();

      return {
        baseToken: marketConfiguration.base_token,
        baseTokenDecimals: marketConfiguration.base_token_decimals,
        baseTokenPriceFeedId: marketConfiguration.base_token_price_feed_id,
        supplyKink: marketConfiguration.supply_kink,
        borrowKink: marketConfiguration.borrow_kink,
        supplyPerSecondInterestRateSlopeLow:
          marketConfiguration.supply_per_second_interest_rate_slope_low,
        supplyPerSecondInterestRateSlopeHigh:
          marketConfiguration.supply_per_second_interest_rate_slope_high,
        supplyPerSecondInterestRateBase:
          marketConfiguration.supply_per_second_interest_rate_base,
        borrowPerSecondInterestRateSlopeLow:
          marketConfiguration.borrow_per_second_interest_rate_slope_low,
        borrowPerSecondInterestRateSlopeHigh:
          marketConfiguration.borrow_per_second_interest_rate_slope_high,
        borrowPerSecondInterestRateBase:
          marketConfiguration.borrow_per_second_interest_rate_base,
        storeFrontPriceFactor: marketConfiguration.store_front_price_factor,
        baseTrackingIndexScale: marketConfiguration.base_tracking_index_scale,
        baseTrackingSupplySpeed: marketConfiguration.base_tracking_supply_speed,
        baseTrackingBorrowSpeed: marketConfiguration.base_tracking_borrow_speed,
        baseMinForRewards: marketConfiguration.base_min_for_rewards,
        baseBorrowMin: marketConfiguration.base_borrow_min,
        targetReserves: marketConfiguration.target_reserves,
      };
    },
    refetchOnWindowFocus: false,
    enabled: !!provider,
  });
};
