import {
  type DeployedMarket,
  calculateBorrowRate,
  calculateSupplyRate,
  getBorrowApr,
  getSupplyApr,
} from '@/utils';
import BigNumber from 'bignumber.js';
import { useMarketConfiguration } from './useMarketConfiguration';

import type { MarketConfiguartion } from '@/__generated__/swaylend/graphql';
import { useQuery } from '@tanstack/react-query';

export const useCreateChartData = (
  marketName: DeployedMarket,
  marketConfiguration: MarketConfiguartion | undefined
) => {
  return useQuery({
    queryKey: ['chartData', marketName],
    queryFn: async () => {
      try {
        if (!marketConfiguration) {
          throw new Error('Market configuration data not available');
        }

        const rateData = [];
        for (let i = 1; i <= 100; i++) {
          const borrowRateForIteration = BigNumber(
            calculateBorrowRate(
              BigNumber(i).times(BigNumber(10).pow(16)),
              marketConfiguration
            ).toString()
          );
          const borrowRateAPR = getBorrowApr(borrowRateForIteration);
          const supplyRateForIteration = BigNumber(
            calculateSupplyRate(
              BigNumber(i).times(BigNumber(10).pow(16)),
              marketConfiguration
            ).toString()
          );
          const supplyRateAPR = getSupplyApr(supplyRateForIteration);
          rateData.push({
            percent: i,
            borrowValue: Number(borrowRateAPR.slice(0, -1)),
            earn: Number(supplyRateAPR.slice(0, -1)),
          });
        }

        return rateData;
      } catch (error) {
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });
};

// const { data: utilization } = useUtilization(marketName as DeployedMarket);
// const currentUtilization = BigNumber(
//   formatUnits(
//     BigNumber(utilization?.toString()!).div(BigNumber(10).pow(18)),
//     18
//   )
// ).toNumber();

// const rateData = [];
// for (let i = 1; i <= 100; i++) {
//   const borrowRateForIteration = BigNumber(
//     calculateBorrowRate(
//       BigNumber(i).times(BigNumber(10).pow(16)),
//       marketConfiguration!
//     ).toString()
//   );
//   const borrowRateAPR = getBorrowApr(borrowRateForIteration);
//   const supplyRateForIteration = BigNumber(
//     calculateSupplyRate(
//       BigNumber(i).times(BigNumber(10).pow(16)),
//       marketConfiguration!
//     ).toString()
//   );
//   const supplyRateAPR = getSupplyApr(supplyRateForIteration);
//   rateData.push({
//     percent: i,
//     borrowValue: Number(borrowRateAPR.slice(0, -1)),
//     earn: Number(supplyRateAPR.slice(0, -1)),
//   });
// }
