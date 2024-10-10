export function stringifyMap<T>(
  map: Map<string, undefined | null | number | string | T> | null | undefined
) {
  return Array.from(map ?? new Map())
    .map(([key, value]) => {
      const valueString =
        typeof value === 'object' ? JSON.stringify(value) : value?.toString();
      return `${key}<==>${valueString ?? 'null'}`;
    })
    .join(',');
}
