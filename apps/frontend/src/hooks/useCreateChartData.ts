import {
  calculateBorrowRate,
  calculateSupplyRate,
  getBorrowApr,
  getSupplyApr,
} from '@/utils';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

export const useCreateChartData = (
  marketName: string,
  marketConfiguration: any
) => {
  const data = useMemo(() => {
    try {
      if (!marketConfiguration) {
        return null;
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
      console.error(error);
      return null;
    }
  }, [marketName, marketConfiguration]);
  return { data };
};
