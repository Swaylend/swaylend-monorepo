import BigNumber from 'bignumber.js';
import type React from 'react';

interface InputFieldProps {
  amount: BigNumber;
  setAmount: (amount: BigNumber) => void;
}

export const InputField = ({ amount, setAmount }: InputFieldProps) => {
  return (
    <input
      type="number"
      value={amount.toNumber()}
      onChange={(e) => setAmount(new BigNumber(e.target.value))}
    />
  );
};
