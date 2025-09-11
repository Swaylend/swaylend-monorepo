import BigNumber from 'bignumber.js';

export function parseUnits(value: BigNumber, decimals = 8): BigNumber {
  return new BigNumber(10).pow(decimals).times(value);
}

export function formatUnits(value: BigNumber, decimals = 8): BigNumber {
  return new BigNumber(value).div(new BigNumber(10).pow(decimals));
}
