import BigNumber from 'bignumber.js';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

interface IProps {
  assetId: string;
  setAssetId?: (assetId: string) => void;

  onMaxClick?: () => void;
  on50Click?: () => void;
  balance?: string;

  disabled?: boolean;

  error: string | null;

  decimals: number;

  amount: BigNumber;
  setAmount?: (amount: BigNumber) => void;
}

export const InputField: React.FC<IProps> = (props) => {
  const [amount, setAmount] = useState<BigNumber>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: number) => {
    if (props.disabled) return;
    setAmount(new BigNumber(v));
    debounce(new BigNumber(v));
  };

  const debounce = useCallback((value: BigNumber) => {
    setTimeout(() => {
      console.log('fml');
      props.setAmount?.(value);
    }, 500);
  }, []);

  return (
    <input
      type="number"
      value={amount.toNumber()}
      onChange={(e) => handleChangeAmount(Number(e.target.value))}
    />
  );
};
