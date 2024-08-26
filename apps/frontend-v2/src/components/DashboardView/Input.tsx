import { ACTION_TYPE, useMarketStore } from '@/stores';
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from '@/utils';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Button } from '../ui/button';
import { InputField } from './InputField';
import { useSupplyCollateral } from '@/hooks';

export const Input = () => {
  const {
    mode,
    actionTokenAssetId,
    tokenAmount,
    action,
    loading,
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
    changeLoading,
  } = useMarketStore();

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(null);
    changeActionTokenAssetId(TOKENS_BY_SYMBOL.USDC.assetId);
  };

  const { mutate: supplyCollateral } = useSupplyCollateral();

  const handleSubmit = () => {
    console.log('hello wenda');
    if (action === ACTION_TYPE.SUPPLY) {
      if (actionTokenAssetId === TOKENS_BY_SYMBOL.USDC.assetId) {
        console.log('supply usdc');
      } else {
        console.log(
          'supply',
          TOKENS_BY_ASSET_ID[actionTokenAssetId ?? ''].symbol
        );
        supplyCollateral();
      }
    }
  };

  return (
    <div>
      <div>
        <Button
          onClick={() => {
            handleBaseTokenClick(ACTION_TYPE.SUPPLY);
          }}
        >
          Supply USDC
        </Button>
        <Button
          onClick={() => {
            handleBaseTokenClick(ACTION_TYPE.WITHDRAW);
          }}
        >
          Withdraw USDC
        </Button>
        <Button
          onClick={() => {
            handleBaseTokenClick(ACTION_TYPE.BORROW);
          }}
        >
          Borrow USDC
        </Button>
        <Button
          onClick={() => {
            handleBaseTokenClick(ACTION_TYPE.REPAY);
          }}
        >
          Repay USDC
        </Button>
        <div className=" bg-orange-700">
          MODE: {mode} AssetId: {actionTokenAssetId} Amount:{' '}
          {(tokenAmount ?? new BigNumber(0)).toFormat(2)} Action: {action}
        </div>
      </div>
      <div>
        <InputField
          amount={tokenAmount ?? BigNumber(0)}
          setAmount={changeTokenAmount}
        />
        <Button onClick={handleSubmit}>LFG</Button>
      </div>
    </div>
  );
};
