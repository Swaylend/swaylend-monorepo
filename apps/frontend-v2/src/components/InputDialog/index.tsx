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
import { formatUnits } from '@/utils';
import { useAccount, useBalance } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import { InputField } from './InputField';
import { PositionSummary } from './PositionSummary';

export const InputDialog = () => {
  const { account } = useAccount();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const {
    mode,
    marketMode,
    market,
    actionTokenAssetId,
    tokenAmount,
    action,
    inputDialogOpen: open,
    changeAction,
    changeTokenAmount,
    changeActionTokenAssetId,
    changeInputDialogOpen: setOpen,
  } = useMarketStore();

  const { data: priceData } = usePrice();

  const { mutate: supplyCollateral } = useSupplyCollateral({
    actionTokenAssetId,
  });

  const { mutate: withdrawCollateral } = useWithdrawCollateral({
    actionTokenAssetId,
  });

  const { mutate: supplyBase } = useSupplyBase();

  const { mutate: withdrawBase } = useWithdrawBase();

  const { mutate: borrowBase } = useBorrowBase();

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
          BigNumber(
            userCollateralAssets?.[marketConfiguration?.baseToken ?? ''] ??
              new BigNumber(0) ??
              0
          ),
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
        changeTokenAmount(finalBalance);
        break;
      }
      case ACTION_TYPE.WITHDRAW:
        changeTokenAmount(finalBalance);
        break;
      case ACTION_TYPE.BORROW:
        // TODO -> Check balance of base asset in Market contract and set that balance if lower than max borrow amount
        changeTokenAmount(finalBalance);
        break;
      case ACTION_TYPE.REPAY: {
        const finalBalanceRepay = finalBalance ?? BigNumber(0);
        const userBorrowed =
          formatUnits(
            userSupplyBorrow.borrowed.plus(10),
            marketConfiguration?.baseTokenDecimals
          ) ?? BigNumber(0);

        if (finalBalanceRepay.gte(userBorrowed)) {
          console.log('here...');
          changeTokenAmount(userBorrowed);
        } else {
          console.log('here smh..', userSupplyBorrow.borrowed.toFixed(2));
          changeTokenAmount(finalBalanceRepay);
        }
        break;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-[400px]">
        <VisuallyHidden.Root asChild>
          <DialogTitle>Input Dialog</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full">
          <div className="w-full flex justify-between">
            <div className="w-1/2 relative h-[64px] flex justify-center items-center">
              {/* TODO -> Disable buttons when not available */}
              <button
                onClick={() => handleModeChange(0)}
                type="button"
                className={cn(
                  `${!(action === 'SUPPLY' || action === 'BORROW') && 'text-neutral4'}`,
                  'w-full font-semibold text-lg'
                )}
              >
                {marketMode === 'lend' ? 'Supply' : 'Borrow'}
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
                onClick={() => handleModeChange(1)}
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
                {/* TODO -> Add errors to the input field (not enough coins, etc...) */}
                <InputField />
              </div>
              <div className="flex mt-2 justify-between items-center w-full">
                <div className="text-neutral4 text-sm">
                  {finalBalance.toFormat(4)}
                  {' available'}
                </div>
                <Button
                  disabled={!finalBalance || finalBalance.eq(0)}
                  onClick={onMaxBtnClick}
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
              <Button onClick={handleSubmit} className="w-1/2">
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
