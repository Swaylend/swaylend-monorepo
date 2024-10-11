import { appConfig } from '@/configs';
import { useCollateralConfigurations, useMarketConfiguration } from '@/hooks';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores';
import { SYMBOL_TO_ICON } from '@/utils';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { Input } from '../ui/input';

export const InputField = ({ error }: { error: boolean }) => {
  const { changeTokenAmount, tokenAmount, actionTokenAssetId, action } =
    useMarketStore();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: collateralConfigurations } = useCollateralConfigurations();

  const [inputValue, setInputValue] = useState<string>('');

  const amountInput = useRef<HTMLInputElement>(null);

  const debounceFocus = useDebounceCallback(() => {
    if (amountInput.current) {
      amountInput.current.focus();
    }
  }, 10);

  useEffect(() => {
    debounceFocus();
  }, []);

  useEffect(() => {
    debounceFocus();
  }, [action]);

  useEffect(() => {
    if (
      tokenAmount.gt(0) &&
      tokenAmount.toString() !== inputValue &&
      `${tokenAmount.toString()}.` !== inputValue
    ) {
      const tokenAmountStr = tokenAmount.toString();
      const [_, inputDecimalPart = ''] = inputValue.split('.');
      const [__, tokenDecimalPart = ''] = tokenAmountStr.split('.');

      const hasTrailingZeros =
        inputDecimalPart.length > tokenDecimalPart.length &&
        inputDecimalPart.endsWith('0');
      if (!hasTrailingZeros || inputValue === '') {
        setInputValue(tokenAmountStr);
      }
    }
  }, [tokenAmount]);

  const debounce = useDebounceCallback(changeTokenAmount, 333);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !marketConfiguration ||
      !collateralConfigurations ||
      !actionTokenAssetId
    ) {
      return;
    }

    let { value } = event.currentTarget;

    // Replace comma to the dot
    value = value.replace(',', '.');

    // Remove minus sign
    value = value.replace('-', '');

    // Remove additional decimal separators
    const parts = value.split('.');
    if (parts.length > 2) {
      value = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    // Add leading zero if only decimal point is entered
    if (value === '.') {
      value = '0.';
    }

    // Allow clearing the input or removing the last character if it's '0'
    if (value === '' || (inputValue === '0' && value === '')) {
      setInputValue('');
      debounce(BigNumber(0));
      return;
    }

    // Remove leading zeros if there's no decimal point
    if (!value.includes('.')) {
      value = value.replace(/^0+/, '') || '0';
    }

    const maxDecimalLength =
      actionTokenAssetId === marketConfiguration.baseToken.bits
        ? marketConfiguration.baseTokenDecimals
        : collateralConfigurations[actionTokenAssetId].decimals;

    // Limit to `actionTokenAssetId` decimal places
    const decimalParts = value.split('.');
    if (decimalParts[1] && decimalParts[1].length > maxDecimalLength) {
      decimalParts[1] = decimalParts[1].slice(0, maxDecimalLength);
      value = decimalParts.join('.');
    }

    // Update only if it's a valid number or empty
    if (value === '' || !Number.isNaN(Number.parseFloat(value))) {
      setInputValue(value);
      debounce(BigNumber(value));
      return;
    }
  };

  return (
    <div className="relative flex w-full">
      <Input
        autoFocus={true}
        type="string"
        className={cn(
          'h-[56px] bg-card border-2',
          error && 'border-red-500 focus-visible:ring-red-500'
        )}
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter amount"
        ref={amountInput}
        disabled={
          !marketConfiguration ||
          !collateralConfigurations ||
          !actionTokenAssetId
        }
      />
      <div className="absolute flex items-center gap-x-2 h-[24px] top-[calc(50%-12px)] left-[calc(100%-80px)]">
        <div className="w-[24px] h-[24px]">
          {actionTokenAssetId && (
            <Image
              alt="token"
              className="rounded-full"
              src={SYMBOL_TO_ICON[appConfig.assets[actionTokenAssetId]]}
              width={32}
              height={32}
            />
          )}
        </div>
        {actionTokenAssetId && (
          <div className="text-sm text-moon font-semibold">
            {appConfig.assets[actionTokenAssetId]}
          </div>
        )}
      </div>
    </div>
  );
};
