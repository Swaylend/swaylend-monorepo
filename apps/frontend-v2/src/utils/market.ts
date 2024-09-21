import BigNumber from 'bignumber.js';
import { BN, bn } from 'fuels';
import { formatUnits } from './BigNumber';

export function getBorrowApr(borrowRate: BigNumber | null | undefined) {
  if (borrowRate == null) return `${BigNumber(0).toFormat(2)}%`;
  const rate = new BigNumber(borrowRate);
  const coefficient = new BigNumber(365)
    .times(24)
    .times(60)
    .times(60)
    .times(100);
  return `${formatUnits(rate.times(coefficient), 18).toFormat(2)}%`;
}

export function getSupplyApr(supplyRate: BigNumber | null | undefined) {
  if (supplyRate == null) return `${BigNumber(0).toFormat(2)}%`;
  const rate = new BigNumber(supplyRate);
  const coefficient = new BigNumber(365)
    .times(24)
    .times(60)
    .times(60)
    .times(100);
  return `${formatUnits(rate.times(coefficient), 18).toFormat(2)}%`;
}

export function calculateSupplyRate(
  utilization: BigNumber | null | undefined,
  marketConfiguration: any
) {
  if (marketConfiguration == null) return BigNumber(0);
  if (utilization == null) return BigNumber(0);
  const FACTOR_SCALE_18 = BigNumber(1).times(BigNumber(10).pow(18));
  const supplyPerSecondInterestRateBase = BigNumber(
    marketConfiguration.supplyPerSecondInterestRateBase.toString()
  );
  const supplyPerSecondInterestRateSlopeLow = BigNumber(
    marketConfiguration.supplyPerSecondInterestRateBase.toString()
  );
  const supplyPerSecondInterestRateSlopeHigh = BigNumber(
    marketConfiguration.supplyPerSecondInterestRateSlopeHigh.toString()
  );
  const supplyKink = BigNumber(marketConfiguration.supplyKink.toString());

  if (utilization.lte(supplyKink)) {
    return supplyPerSecondInterestRateBase.plus(
      supplyPerSecondInterestRateSlopeLow.times(
        utilization.div(FACTOR_SCALE_18)
      )
    );
  }
  return supplyPerSecondInterestRateBase
    .plus(
      supplyPerSecondInterestRateSlopeLow.times(supplyKink).div(FACTOR_SCALE_18)
    )
    .plus(
      supplyPerSecondInterestRateSlopeHigh.times(
        utilization.minus(supplyKink).div(FACTOR_SCALE_18)
      )
    );
}

export function calculateBorrowRate(
  utilization: BigNumber | null | undefined,
  marketConfiguration: any
) {
  if (marketConfiguration == null) return BigNumber(0);
  if (utilization == null) return BigNumber(0);
  const FACTOR_SCALE_18 = BigNumber(1).times(BigNumber(10).pow(18));
  const borrowPerSecondInterestRateBase = BigNumber(
    marketConfiguration.borrowPerSecondInterestRateBase.toString()
  );
  const borrowPerSecondInterestRateSlopeLow = BigNumber(
    marketConfiguration.borrowPerSecondInterestRateSlopeLow.toString()
  );
  const borrowPerSecondInterestRateSlopeHigh = BigNumber(
    marketConfiguration.borrowPerSecondInterestRateSlopeHigh.toString()
  );
  const borrowKink = BigNumber(marketConfiguration.borrowKink.toString());
  if (utilization.lte(borrowKink)) {
    return borrowPerSecondInterestRateBase.plus(
      borrowPerSecondInterestRateSlopeLow.times(
        utilization.div(FACTOR_SCALE_18)
      )
    );
  }
  return borrowPerSecondInterestRateBase
    .plus(
      borrowPerSecondInterestRateSlopeLow.times(borrowKink).div(FACTOR_SCALE_18)
    )
    .plus(
      borrowPerSecondInterestRateSlopeHigh.times(
        utilization.minus(borrowKink).div(FACTOR_SCALE_18)
      )
    );
}
