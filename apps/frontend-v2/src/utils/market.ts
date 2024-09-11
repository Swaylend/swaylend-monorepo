import BigNumber from 'bignumber.js';
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
