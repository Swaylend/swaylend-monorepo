import { appConfig } from '@/configs';
import { useMarketStore } from '@/stores/market-store';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMarketBasicsWithInterest } from './use-market-basics-with-interest';
import { useMarketConfiguration } from './use-market-configuration';
import { usePrice } from './use-price';

dayjs.extend(utc);

const calculateRewardsAprForPool = (
  tokenAmount: BigNumber,
  tokenPrice: BigNumber,
  durationInDays: number,
  currentTvl: BigNumber
) => {
  return tokenAmount
    .times(tokenPrice)
    .times(365)
    .dividedBy(durationInDays)
    .dividedBy(currentTvl);
};

export const useRewards = (marketParam?: string) => {
  const storeMarket = useMarketStore.use.market();
  const market = marketParam ?? storeMarket;

  const { data: marketBasics } = useMarketBasicsWithInterest(market);
  const { data: priceData } = usePrice(market);
  const { data: marketConfiguration } = useMarketConfiguration(market);

  return useQuery({
    queryKey: [
      'rewards',
      market,
      marketBasics,
      priceData?.prices,
      marketConfiguration,
    ],
    queryFn: async () => {
      if (!marketBasics || !priceData || !marketConfiguration) {
        return {
          supplyRewardApr: BigNumber(0),
          borrowRewardApr: BigNumber(0),
        };
      }

      const rewardsConfig = appConfig.rewards[market];

      const today = dayjs().utc().startOf('day');
      const activeRewards = rewardsConfig.filter((reward) => {
        return (
          (today.isAfter(dayjs(reward.startDate).utc().startOf('day')) ||
            today.isSame(dayjs(reward.startDate).utc().startOf('day'))) &&
          today.isBefore(dayjs(reward.endDate).utc().startOf('day'))
        );
      });

      const { total_borrow_base, total_supply_base } = marketBasics;

      const totalBorrowValue = BigNumber(total_borrow_base.toString())
        .times(priceData.prices[marketConfiguration.baseToken.bits])
        .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

      const totalSupplyValue = BigNumber(total_supply_base.toString())
        .times(priceData.prices[marketConfiguration.baseToken.bits])
        .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

      return activeRewards
        .map((reward) => {
          const tokenPrice = priceData.prices[reward.assetId];
          const durationInDays = reward.durationInDays;
          const supplyRewardPool = BigNumber(reward.poolSize).times(
            reward.supplyRewardPercentage
          );
          const borrowRewardPool = BigNumber(reward.poolSize).times(
            reward.borrowRewardPercentage
          );

          const supplyRewardApr = calculateRewardsAprForPool(
            supplyRewardPool,
            tokenPrice,
            durationInDays,
            totalSupplyValue
          );
          const borrowRewardApr = calculateRewardsAprForPool(
            borrowRewardPool,
            tokenPrice,
            durationInDays,
            totalBorrowValue
          );

          return {
            supplyRewardApr,
            borrowRewardApr,
          };
        })
        .reduce(
          (acc, curr) => {
            return {
              supplyRewardApr: acc.supplyRewardApr.plus(curr.supplyRewardApr),
              borrowRewardApr: acc.borrowRewardApr.plus(curr.borrowRewardApr),
            };
          },
          {
            supplyRewardApr: BigNumber(0),
            borrowRewardApr: BigNumber(0),
          }
        );
    },
    enabled: !!marketBasics && !!priceData && !!marketConfiguration,
    refetchOnWindowFocus: false,
  });
};
