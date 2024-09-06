import { useMarketStore } from '@/stores';
import BigNumber from 'bignumber.js';
import type React from 'react';
import { useRef, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

export const InputField = () => {
  const { changeTokenAmount } = useMarketStore();

  const [inputValue, setInputValue] = useState<string>('');

  const debounce = useDebounceCallback(changeTokenAmount, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.currentTarget;
    // Replace comma to the dot
    value = value.replace(',', '.');

    // Replace leading zeros
    if (/^0+[^.]/.test(value)) {
      value = value.replace(/^0+/, '');
      if (value === '') {
        value = '0';
      }
    }

    if (value === '.') {
      value = '0.';
    }
    // TODO: use correct decimals
    // Limit the number of decimal places to token decimals
    if (value && !/^\d+(.\d{0,9})?$/.test(value)) {
      return;
    }
    if (value === '') {
      setInputValue('');
      debounce(BigNumber(0));
      return;
    }
    if (BigNumber(value).isNaN()) return;

    setInputValue(value);
    debounce(BigNumber(value));
  };

  return (
    <input
      type="string"
      value={inputValue}
      placeholder="0.00"
      onChange={handleChange}
    />
  );
};
