import { useMarketStore } from '@/stores';
import BigNumber from 'bignumber.js';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { Input } from '../ui/input';
import BTC from '/public/tokens/bitcoin.svg?url';
import ETH from '/public/tokens/ethereum.svg?url';
import BNB from '/public/tokens/sway.svg?url';
import UNI from '/public/tokens/uni.svg?url';
import USDC from '/public/tokens/usdc.svg?url';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { ASSET_ID_TO_SYMBOL, SYMBOL_TO_NAME } from '@/utils';

const SYMBOL_TO_LOGO: Record<string, StaticImport> = {
  ETH: ETH,
  BTC: BTC,
  BNB: BNB,
  UNI: UNI,
  USDC: USDC,
};

export const InputField = () => {
  const { changeTokenAmount, tokenAmount, actionTokenAssetId } =
    useMarketStore();

  useEffect(() => {
    if (tokenAmount && tokenAmount.toString() !== inputValue)
      setInputValue(tokenAmount.toString());
  }, [tokenAmount]);

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
    <div className="relative flex w-full">
      <Input
        type="string"
        className="h-[56px] bg-card"
        value={inputValue}
        placeholder="0.00"
        onChange={handleChange}
      />
      <div className="absolute flex items-center gap-x-2 h-[24px] top-[calc(50%-12px)] left-[calc(100%-80px)]">
        <div className="w-[24px] h-[24px]">
          <Image
            alt={'token'}
            className="rounded-full"
            src={SYMBOL_TO_LOGO[ASSET_ID_TO_SYMBOL[actionTokenAssetId ?? '']]}
            width={32}
            height={32}
          />
        </div>
        <div className="text-sm text-neutral4 font-semibold">
          {ASSET_ID_TO_SYMBOL[actionTokenAssetId ?? '']}
        </div>
      </div>
    </div>
  );
};
