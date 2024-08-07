import { rem as toRem } from 'polished';
import type { Undefinable } from 'tsdef';

export const rem = (value?: string | number): Undefinable<string> => {
  if (typeof value === 'number') {
    return toRem(`${value}px`);
  }

  return value?.endsWith('px') ? toRem(value) : value;
};
