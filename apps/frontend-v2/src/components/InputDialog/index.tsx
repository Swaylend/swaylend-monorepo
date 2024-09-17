import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useBorrowBase,
  useBorrowCapacity,
  useCollateralConfigurations,
  useMarketBalanceOfBase,
  useMarketConfiguration,
  usePrice,
  useSupplyBase,
  useSupplyCollateral,
  useUserCollateralAssets,
  useUserSupplyBorrow,
  useWithdrawBase,
  useWithdrawCollateral,
} from '@/hooks';
import { cn } from '@/lib/utils';
import { ACTION_TYPE, MARKET_MODE, useMarketStore } from '@/stores';
import { ASSET_ID_TO_SYMBOL, formatUnits } from '@/utils';
import { useAccount, useBalance, useIsConnected } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { InputField } from './InputField';
import { PositionSummary } from './PositionSummary';

export const InputDialog = () => {
  const { account } = useAccount();
  const { isConnected } = useIsConnected();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const {
    actionTokenAssetId,
    tokenAmount,
    action,
    inputDialogOpen: open,
    changeAction,
    changeTokenAmount,
    changeInputDialogOpen: setOpen,
  } = useMarketStore();

  const { data: priceData } = usePrice();
  const marketBalanceOfBase = useMarketBalanceOfBase();

  const { mutate: supplyCollateral } = useSupplyCollateral({
    actionTokenAssetId,
  });

  const { mutate: withdrawCollateral } = useWithdrawCollateral({
    actionTokenAssetId,
  });

  const { mutate: supplyBase } = useSupplyBase();

  const { mutate: withdrawBase } = useWithdrawBase();

  const { mutate: borrowBase } = useBorrowBase();

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!marketConfiguration) return;

    switch (action) {
      case ACTION_TYPE.SUPPLY: {
        if (actionTokenAssetId === marketConfiguration.baseToken) {
          supplyBase(tokenAmount);
        } else {
          supplyCollateral(tokenAmount);
        }
        break;
      }
      case ACTION_TYPE.WITHDRAW: {
        if (!priceData) return;

        if (actionTokenAssetId === marketConfiguration.baseToken) {
          withdrawBase({
            tokenAmount,
            priceUpdateData: priceData.priceUpdateData,
          });
        } else {
          withdrawCollateral({
            tokenAmount,
            priceUpdateData: priceData.priceUpdateData,
          });
        }
        break;
      }
      case ACTION_TYPE.BORROW:
        if (!priceData || !tokenAmount.gt(0)) return;

        borrowBase({
          tokenAmount,
          priceUpdateData: priceData.priceUpdateData,
        });
        break;
      case ACTION_TYPE.REPAY:
        supplyBase(tokenAmount);
        break;
      default:
        break;
    }
    // setOpen(false);
  };

  const handleModeChange = (action: ACTION_TYPE) => {
    changeAction(action);
  };

  const { balance } = useBalance({
    address: account ?? '',
    assetId: actionTokenAssetId ?? '',
  });

  const finalBalance = useMemo(() => {
    if (action === 'REPAY') {
      return formatUnits(
        BigNumber(balance?.toString() ?? 0),
        marketConfiguration?.baseTokenDecimals
      );
    }
    if (action === 'SUPPLY') {
      if (actionTokenAssetId === marketConfiguration?.baseToken) {
        return formatUnits(
          BigNumber(balance?.toString() ?? 0),
          marketConfiguration?.baseTokenDecimals
        );
      }
      return formatUnits(
        BigNumber(balance?.toString() ?? 0),
        collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals ?? 9
      );
    }
    if (action === 'WITHDRAW') {
      if (actionTokenAssetId === marketConfiguration?.baseToken) {
        return formatUnits(
          BigNumber(userSupplyBorrow?.supplied ?? new BigNumber(0) ?? 0),
          marketConfiguration?.baseTokenDecimals
        );
      }
      return formatUnits(
        BigNumber(
          userCollateralAssets?.[actionTokenAssetId ?? ''] ??
            new BigNumber(0) ??
            0
        ),
        collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals ?? 9
      );
    }

    if (action === 'BORROW') {
      return borrowCapacity ?? BigNumber(0);
    }

    return BigNumber(0);
  }, [
    balance,
    actionTokenAssetId,
    action,
    marketConfiguration,
    collateralConfigurations,
  ]);

  const onMaxBtnClick = () => {
    if (userSupplyBorrow == null || finalBalance == null) return null;

    switch (action) {
      case ACTION_TYPE.SUPPLY: {
        changeTokenAmount(BigNumber(finalBalance.toFixed(9)));
        break;
      }
      case ACTION_TYPE.WITHDRAW:
        changeTokenAmount(BigNumber(finalBalance.toFixed(9)));
        break;
      case ACTION_TYPE.BORROW:
        if (marketBalanceOfBase?.formatted.lt(finalBalance)) {
          changeTokenAmount(
            BigNumber(marketBalanceOfBase?.formatted.toFixed(9))
          );
        } else {
          changeTokenAmount(BigNumber(finalBalance.toFixed(9)));
        }
        break;
      case ACTION_TYPE.REPAY: {
        const finalBalanceRepay = finalBalance ?? BigNumber(0);

        if (userSupplyBorrow.borrowed.eq(0)) return;
        const userBorrowed =
          formatUnits(
            userSupplyBorrow.borrowed.plus(10),
            marketConfiguration?.baseTokenDecimals
          ) ?? BigNumber(0);

        if (finalBalanceRepay.gte(userBorrowed)) {
          changeTokenAmount(BigNumber(userBorrowed.toFixed(9)));
        } else {
          changeTokenAmount(BigNumber(finalBalanceRepay.toFixed(9)));
        }
        break;
      }
    }
  };

  const { balance: actionTokenBalance } = useBalance({
    address: account ?? undefined,
    assetId: actionTokenAssetId ?? undefined,
  });

  const { balance: baseTokenBalance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken,
  });

  const tokenInputError = (): string | null => {
    if (
      actionTokenAssetId == null ||
      borrowCapacity == null ||
      marketConfiguration == null ||
      !userSupplyBorrow ||
      baseTokenBalance == null ||
      userCollateralAssets == null ||
      actionTokenBalance == null
    ) {
      return null;
    }

    if (tokenAmount == null || tokenAmount.eq(0)) return null;

    if (action === ACTION_TYPE.SUPPLY) {
      let balance = BigNumber(0);
      if (actionTokenAssetId === marketConfiguration?.baseToken) {
        balance = formatUnits(
          BigNumber(actionTokenBalance.toString()),
          marketConfiguration?.baseTokenDecimals
        );
      } else {
        balance = formatUnits(
          BigNumber(actionTokenBalance.toString()),
          collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals
        );
      }
      if (balance == null) return null;
      if (balance.lt(tokenAmount)) return 'Insufficient balance';
    }

    if (action === ACTION_TYPE.WITHDRAW) {
      if (actionTokenAssetId === marketConfiguration?.baseToken) {
        if (tokenAmount.gt(userSupplyBorrow.supplied ?? BigNumber(0))) {
          return 'Insufficient balance';
        }
      } else {
        const balance = formatUnits(
          BigNumber(userCollateralAssets?.[actionTokenAssetId] ?? BigNumber(0)),
          collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals
        );
        if (tokenAmount.gt(balance ?? BigNumber(0))) {
          return 'Insufficient balance';
        }
      }
    }

    if (action === ACTION_TYPE.BORROW) {
      if (marketBalanceOfBase?.formatted.eq(0)) {
        return `There is no ${ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken]} to borrow`;
      }

      if (marketBalanceOfBase?.formatted.lt(tokenAmount)) {
        return `There is not enough ${ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken]} to borrow`;
      }

      if (tokenAmount.lt(new BigNumber(10))) {
        return `Minimum borrow amount is 10 ${ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken]}`;
      }

      if (tokenAmount.gt(borrowCapacity)) {
        return 'You are trying to borrow more than the max borrowable amount';
      }
    }

    if (action === ACTION_TYPE.REPAY) {
      const balance = formatUnits(
        BigNumber(baseTokenBalance?.toString()),
        marketConfiguration?.baseTokenDecimals
      );
      if (tokenAmount.gt(balance ?? BigNumber(0)))
        return 'Insufficient balance';

      // Balance more than user borrowed
      if (userSupplyBorrow.borrowed.eq(0)) return 'You have no debt';
      const userBorrowed =
        formatUnits(
          userSupplyBorrow.borrowed.plus(20),
          marketConfiguration?.baseTokenDecimals
        ) ?? BigNumber(0);

      if (tokenAmount.gt(userBorrowed))
        return 'You are trying to repay more than your debt';
    }

    return null;
  };

  // Close modal if user disconnects...
  useEffect(() => {
    if (!isConnected) {
      setOpen(false);
    }
  }, [isConnected]);

  useEffect(() => {
    setError(tokenInputError());
  }, [tokenAmount, actionTokenAssetId, action]);

  const disabledLeftTab = useMemo(() => {
    if (action === ACTION_TYPE.SUPPLY || action === ACTION_TYPE.WITHDRAW) {
      // Lend/Withdraw
      if (actionTokenAssetId === marketConfiguration?.baseToken) {
      }
      // Supply collateral/withdraw
      if (!account || balance?.eq(0)) {
        return true;
      }

      return false;
    }

    // Borrow/Repay
    if (!account || !borrowCapacity || borrowCapacity.eq(0)) {
      return true;
    }

    return false;
  }, [
    account,
    borrowCapacity,
    balance,
    marketConfiguration,
    actionTokenAssetId,
  ]);

  const disabledRightTab = useMemo(() => {
    if (action === ACTION_TYPE.SUPPLY || action === ACTION_TYPE.WITHDRAW) {
      // Lend/Withdraw
      if (actionTokenAssetId === marketConfiguration?.baseToken) {
        if (!account || !userSupplyBorrow || userSupplyBorrow?.supplied.eq(0)) {
          return true;
        }
      }
      // Supply collateral/withdraw
      else if (
        !account ||
        !actionTokenAssetId ||
        (userCollateralAssets?.[actionTokenAssetId] ?? BigNumber(0)).eq(0)
      ) {
        return true;
      }

      return false;
    }

    // Borrow/Repay
    if (!account || !userSupplyBorrow || userSupplyBorrow.borrowed.eq(0)) {
      return true;
    }

    return false;
  }, [
    account,
    userSupplyBorrow,
    userCollateralAssets,
    actionTokenAssetId,
    marketConfiguration,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-sm:w-[90%] max-sm:rounded-xl max-w-[400px]">
        <VisuallyHidden.Root asChild>
          <DialogTitle>Input Dialog</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full">
          <div className="w-full flex justify-between">
            <div className="w-1/2 relative h-[64px] flex justify-center items-center">
              <button
                disabled={disabledLeftTab}
                onMouseDown={() =>
                  handleModeChange(
                    action === ACTION_TYPE.WITHDRAW ||
                      action === ACTION_TYPE.SUPPLY
                      ? ACTION_TYPE.SUPPLY
                      : ACTION_TYPE.BORROW
                  )
                }
                type="button"
                className={cn(
                  !(action === 'SUPPLY' || action === 'BORROW') &&
                    'text-lavender',
                  'w-full font-semibold text-lg h-full',
                  disabledLeftTab && 'text-gray-500'
                )}
              >
                {action === ACTION_TYPE.SUPPLY ||
                action === ACTION_TYPE.WITHDRAW
                  ? 'Supply'
                  : 'Borrow'}
              </button>
              <div
                className={cn(
                  action === 'SUPPLY' || action === 'BORROW'
                    ? 'block'
                    : 'hidden'
                )}
              >
                <div
                  className={cn(
                    '-z-10 w-[60%] top-[62px] h-2 bg-gradient-to-r from-popover  via-primary to-popover absolute left-[calc(20%)]'
                  )}
                />
                <div
                  className={cn(
                    '-z-10 absolute blur-xl top-[50px] left-[calc(20%)] rounded-full w-[60%] h-8 bg-primary'
                  )}
                />
              </div>
            </div>
            <div className="w-1/2 relative h-[64px] flex justify-center items-center">
              <button
                disabled={disabledRightTab}
                onMouseDown={() =>
                  handleModeChange(
                    action === ACTION_TYPE.BORROW
                      ? ACTION_TYPE.REPAY
                      : ACTION_TYPE.WITHDRAW
                  )
                }
                type="button"
                className={cn(
                  !(action === 'WITHDRAW' || action === 'REPAY') &&
                    'text-lavender',
                  'w-full font-semibold text-lg h-full',
                  disabledRightTab && 'text-gray-500'
                )}
              >
                {action === ACTION_TYPE.SUPPLY ||
                action === ACTION_TYPE.WITHDRAW
                  ? 'Withdraw'
                  : 'Repay'}
              </button>
              <div
                className={`${action === 'WITHDRAW' || action === 'REPAY' ? 'block' : 'hidden'}`}
              >
                <div
                  className={cn(
                    '-z-10 w-[60%] top-[62px] h-2 bg-gradient-to-r from-popover  via-primary to-popover absolute left-[calc(20%)]'
                  )}
                />
                <div
                  className={cn(
                    '-z-10 absolute blur-xl top-[50px] left-[calc(20%)] rounded-full w-[60%] h-8 bg-primary'
                  )}
                />
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-y-[30px] pt-[30px] h-[calc(100%-68px)] bg-popover p-[16px] z-10">
            <div>
              <div>
                <InputField error={error !== null} />
                {error && (
                  <div className="text-red-500 mt-2 text-sm">{error}</div>
                )}
              </div>
              <div className="flex mt-2 justify-between items-center w-full">
                <div className="text-moon text-sm">
                  {finalBalance.toFormat(4)}
                  {action === ACTION_TYPE.BORROW
                    ? ' available to borrow'
                    : ' available'}
                </div>
                <Button
                  disabled={!finalBalance || finalBalance.eq(0)}
                  onMouseDown={onMaxBtnClick}
                  size="sm"
                  variant={'secondary'}
                >
                  Max
                </Button>
              </div>
            </div>
            <div className="flex gap-x-2 w-full">
              <DialogClose asChild>
                <Button className="w-1/2" variant={'secondary'}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={error !== null || tokenAmount.eq(0)}
                onMouseDown={handleSubmit}
                className="w-1/2"
              >
                Submit
              </Button>
            </div>
            <div className="w-full flex justify-center">
              <PositionSummary />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
