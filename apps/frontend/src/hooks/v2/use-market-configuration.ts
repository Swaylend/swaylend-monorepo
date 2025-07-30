import { useQuery } from '@tanstack/react-query';
import { useMarketContract } from '@/contracts/v2/use-market-contract';
import { useMarketStore } from '@/stores/market-store';

export const useMarketConfiguration = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;
  const marketContract = useMarketContract(market);

  return useQuery({
    queryKey: [
      'marketConfiguration',
      'v2',
      marketContract?.account?.address,
      marketContract?.id,
    ],
    queryFn: async () => {
      if (!marketContract) return null;

      const { value: marketConfiguration } = await marketContract.functions
        .get_market_configuration()
        .get();

      return {
        baseToken: marketConfiguration.base_token,
        baseTokenDecimals: marketConfiguration.base_token_decimals,
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
        oracleMaxConfidenceWidth:
          marketConfiguration.oracle_max_confidence_width,
      };
    },
    refetchOnWindowFocus: false,
    enabled: !!marketContract,
  });
};
