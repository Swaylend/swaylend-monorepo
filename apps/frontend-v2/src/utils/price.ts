import BigNumber from 'bignumber.js';

const getPrice = (data: Record<string, BigNumber>, assetId: string) => {
  return data[assetId] ?? new BigNumber(0);
};

const getFormattedPrice = (
  data: Record<string, BigNumber>,
  assetId: string
): string => {
  if (!data[assetId]) return '$ 0.00';
  const price = data[assetId];
  return `$${price.toFixed(2)}`;
};
