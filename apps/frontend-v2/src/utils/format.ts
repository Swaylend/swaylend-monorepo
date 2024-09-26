export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = 'en-US'
) {
  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    const million = absValue / 1000000;
    const formattedMillion = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(million);

    return `${formattedMillion.replace('$', '')}M`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('$', '');
}

export function removeDuplicatesByProperty(arr: any[], prop: string) {
  const seen = new Set();
  return arr.filter((item) => {
    if (!seen.has(item[prop])) {
      seen.add(item[prop]);
      return true;
    }
    return false;
  });
}