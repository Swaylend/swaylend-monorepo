import BigNumber from 'bignumber.js';

export const getFormattedPrice = (number: BigNumber): string => {
  if (!number || number.isNaN() || number.eq(0)) return '$ 0.00';

  if (number.gte(1000000000)) {
    return `$ ${number.div(1000000000).toFixed(2, BigNumber.ROUND_FLOOR)}B`;
  }
  if (number.gte(1000000)) {
    return `$ ${number.div(1000000).toFixed(2, BigNumber.ROUND_FLOOR)}M`;
  }
  if (number.gte(1000)) {
    return `$ ${number.div(1000).toFixed(2, BigNumber.ROUND_FLOOR)}K`;
  }
  return `$ ${number.toFixed(2, BigNumber.ROUND_FLOOR)}`;
};

export const getFormattedNumber = (
  number: BigNumber,
  positive?: boolean
): string => {
  if (!number || number.isNaN() || number.eq(0)) return '0.0';

  if (number.gte(1000000000)) {
    return `${number.div(1000000000).toFixed(4, BigNumber.ROUND_FLOOR)}B`;
  }
  if (number.gte(1000000)) {
    return `${number.div(1000000).toFixed(4, BigNumber.ROUND_FLOOR)}M`;
  }
  if (number.gte(1000)) {
    return `${number.div(1000).toFixed(4, BigNumber.ROUND_FLOOR)}K`;
  }

  if (positive && number.lt(0)) {
    return '0.0';
  }

  return `${number.toFixed(4, BigNumber.ROUND_FLOOR)}`;
};
