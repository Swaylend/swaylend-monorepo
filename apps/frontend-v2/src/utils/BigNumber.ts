import BigNumber from 'bignumber.js';

const bigNumberify = (n: any): string | number => {
  if (n?.toString) {
    const primitive = n.toString();

    if (typeof primitive !== 'object') {
      return primitive;
    }
  }

  return n;
};

export function parseUnits(value: BigNumber, decimals = 8): BigNumber {
  return new BigNumber(10).pow(decimals).times(bigNumberify(value));
}

export function formatUnits(value: BigNumber, decimals = 8): BigNumber {
  return new BigNumber(value).div(new BigNumber(10).pow(decimals));
}
