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
import { ACTION_TYPE, useMarketStore } from '@/stores';
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
    marketMode,
    actionTokenAssetId,
    tokenAmount,
    action,
    inputDialogOpen: open,
    changeAction,
    changeTokenAmount,
    changeInputDialogOpen: setOpen,
  } = useMarketStore();

  const { data: priceData } = usePrice();
  const { data: marketBalanceOfBase } = useMarketBalanceOfBase();

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

  const handleModeChange = (value: number) => {
    if (value === 0) {
      if (marketMode === 'lend') {
        changeAction(ACTION_TYPE.SUPPLY);
      }
      if (marketMode === 'borrow') {
        changeAction(ACTION_TYPE.BORROW);
      }
    }
    if (value === 1) {
      if (marketMode === 'lend') {
        changeAction(ACTION_TYPE.WITHDRAW);
      }
      if (marketMode === 'borrow') {
        changeAction(ACTION_TYPE.REPAY);
      }
    }
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
      const baseBalance = formatUnits(
        BigNumber(baseTokenBalance?.toString()),
        marketConfiguration?.baseTokenDecimals
      );

      if (baseBalance?.eq(0)) {
        return `There is no ${ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken]} to borrow`;
      }

      // TODO: Get minimum borrow amount from MarketConfiguration
      if (tokenAmount.lt(new BigNumber(10))) {
        return `Minimum borrow amount is 10 ${ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken]}`;
      }

      // If reserve is less than user collateral
      if (borrowCapacity.gt(baseBalance)) {
        if (tokenAmount?.gt(baseBalance ?? 0)) {
          const max = formatUnits(
            baseBalance,
            marketConfiguration?.baseTokenDecimals
          ).toFormat(2);

          return `Max to borrow is ${max} ${ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken]}`;
        }
        return null;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-sm:w-[90%] max-sm:rounded-xl max-w-[400px]">
        <VisuallyHidden.Root asChild>
          <DialogTitle>Input Dialog</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full">
          <div className="w-full flex justify-between">
            <div className="w-1/2 relative h-[64px] flex justify-center items-center">
              {/* TODO -> Disable buttons when not available */}
              <button
                onMouseDown={() => handleModeChange(0)}
                type="button"
                className={cn(
                  `${!(action === 'SUPPLY' || action === 'BORROW') && 'text-neutral4'}`,
                  'w-full font-semibold text-lg'
                )}
              >
                {action === 'SUPPLY' ? 'Supply' : 'Borrow'}
              </button>
              <div
                className={`${action === 'SUPPLY' || action === 'BORROW' ? 'block' : 'hidden'}`}
              >
                <div
                  className={cn(
                    '-z-10 w-[60%] top-[62px] h-2 bg-gradient-to-r from-popover  via-accent to-popover absolute left-[calc(20%)]'
                  )}
                />
                <div
                  className={cn(
                    '-z-10 absolute blur-xl top-[50px] left-[calc(20%)] rounded-full w-[60%] h-8 bg-primary01'
                  )}
                />
              </div>
            </div>
            <div className="w-1/2 relative h-[64px] flex justify-center items-center">
              <button
                onMouseDown={() => handleModeChange(1)}
                type="button"
                className={cn(
                  `${!(action === 'WITHDRAW' || action === 'REPAY') && 'text-neutral4'}`,
                  'w-full font-semibold text-lg'
                )}
              >
                {marketMode === 'lend' ? 'Withdraw' : 'Repay'}
              </button>
              <div
                className={`${action === 'WITHDRAW' || action === 'REPAY' ? 'block' : 'hidden'}`}
              >
                <div
                  className={cn(
                    '-z-10 w-[60%] top-[62px] h-2 bg-gradient-to-r from-popover  via-accent to-popover absolute left-[calc(20%)]'
                  )}
                />
                <div
                  className={cn(
                    '-z-10 absolute blur-xl top-[50px] left-[calc(20%)] rounded-full w-[60%] h-8 bg-primary01'
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
                <div className="text-neutral4 text-sm">
                  {finalBalance.toFormat(4)}
                  {action === ACTION_TYPE.BORROW
                    ? ' available to borrow'
                    : ' available'}
                </div>
                <Button
                  disabled={!finalBalance || finalBalance.eq(0)}
                  onMouseDown={onMaxBtnClick}
                  size={'sm'}
                  variant={'tertiary-card'}
                >
                  Max
                </Button>
              </div>
            </div>
            <div className="flex gap-x-2 w-full">
              <DialogClose asChild>
                <Button className="w-1/2" variant={'tertiary'}>
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
