import { useSupplyCollateral } from '@/hooks';
import { ACTION_TYPE, useMarketStore } from '@/stores';
import { TOKENS_BY_SYMBOL } from '@/utils';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Button } from '../ui/button';
import { InputField } from './InputField';

export const Input = () => {
  const {
    mode,
    actionTokenAssetId,
    tokenAmount,
    action,
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
  } = useMarketStore();

  const handleBaseTokenClick = (action: ACTION_TYPE) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeActionTokenAssetId(TOKENS_BY_SYMBOL.USDC.assetId);
  };

  const { mutate: supplyCollateral } = useSupplyCollateral({
    actionTokenAssetId,
  });

  const handleSubmit = () => {
    switch (action) {
      case ACTION_TYPE.SUPPLY: {
        if (actionTokenAssetId === TOKENS_BY_SYMBOL.USDC.assetId) {
        } else {
          supplyCollateral(tokenAmount);
        }
        break;
      }
      case ACTION_TYPE.WITHDRAW:
        break;
      case ACTION_TYPE.BORROW:
        break;
      case ACTION_TYPE.REPAY:
        break;

      default:
        break;
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
        <InputField amount={tokenAmount} setAmount={changeTokenAmount} />
        <Button onClick={handleSubmit}>Confirm</Button>
      </div>
    </div>
  );
};
