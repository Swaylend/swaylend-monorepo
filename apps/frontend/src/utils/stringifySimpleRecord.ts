export function stringifySimpleRecord<T>(
  record:
    | Record<string, undefined | null | number | string | T>
    | null
    | undefined
) {
  return Object.keys(record ?? {})
    .map((key) => {
      const value = record?.[key];
      const valueString =
        typeof value === 'object' ? JSON.stringify(value) : value?.toString();
      return `${key}<==>${valueString ?? 'null'}`;
    })
    .join(',');
}
