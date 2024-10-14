import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { appConfig } from '@/configs';
import {
  useBalance,
  useBorrowBase,
  useBorrowCapacity,
  useCollateralConfigurations,
  useMarketBalanceOfBase,
  useMarketConfiguration,
  useMaxWithdrawableCollateral,
  usePrice,
  useSupplyBase,
  useSupplyCollateral,
  useTotalCollateral,
  useUserCollateralAssets,
  useUserSupplyBorrow,
  useWithdrawBase,
  useWithdrawCollateral,
} from '@/hooks';
import { cn } from '@/lib/utils';
import {
  ACTION_TYPE,
  selectAction,
  selectActionTokenAssetId,
  selectChangeAction,
  selectChangeInputDialogOpen,
  selectChangeTokenAmount,
  selectInputDialogOpen,
  selectTokenAmount,
  useMarketStore,
} from '@/stores';
import { SYMBOL_TO_NAME, formatUnits, getFormattedNumber } from '@/utils';
import { useAccount, useIsConnected } from '@fuels/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import BigNumber from 'bignumber.js';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { InputField } from './InputField';
import { PositionSummary } from './PositionSummary';

export const InputDialog = () => {
  const { account } = useAccount();
  const { isConnected } = useIsConnected();
  const { data: marketConfiguration } = useMarketConfiguration();
  const { data: userCollateralAssets } = useUserCollateralAssets();
  const { data: collateralConfigurations } = useCollateralConfigurations();
  const { data: collateralBalances } = useTotalCollateral();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const actionTokenAssetId = useMarketStore(selectActionTokenAssetId);
  const tokenAmount = useMarketStore(selectTokenAmount);
  const action = useMarketStore(selectAction);
  const open = useMarketStore(selectInputDialogOpen);
  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const setOpen = useMarketStore(selectChangeInputDialogOpen);

  const { data: priceData } = usePrice();
  const { data: marketBalanceOfBase } = useMarketBalanceOfBase();

  const { mutate: supplyCollateral, isPending: isSupplyCollateralPending } =
    useSupplyCollateral({
      actionTokenAssetId,
    });

  const { mutate: withdrawCollateral, isPending: isWithdrawCollateralPending } =
    useWithdrawCollateral({
      actionTokenAssetId,
    });

  const { mutate: supplyBase, isPending: isSupplyBasePending } =
    useSupplyBase();

  const { mutate: withdrawBase, isPending: isWithdrawBasePending } =
    useWithdrawBase();

  const { mutate: borrowBase, isPending: isBorrowBasePending } =
    useBorrowBase();

  const isAnyActionPending = useMemo(
    () =>
      isSupplyCollateralPending ||
      isWithdrawCollateralPending ||
      isSupplyBasePending ||
      isWithdrawBasePending ||
      isBorrowBasePending,
    [
      isSupplyCollateralPending,
      isWithdrawCollateralPending,
      isSupplyBasePending,
      isWithdrawBasePending,
      isBorrowBasePending,
    ]
  );

  const [error, setError] = useState<string | null>(null);

  const isLending = useMemo(() => {
    if (
      (action === ACTION_TYPE.SUPPLY || action === ACTION_TYPE.WITHDRAW) &&
      actionTokenAssetId === marketConfiguration?.baseToken.bits
    ) {
      return true;
    }
    return false;
  }, [action, actionTokenAssetId, marketConfiguration]);

  const { data: maxWithdrawableCollateral } =
    useMaxWithdrawableCollateral(actionTokenAssetId);

  const handleSubmit = () => {
    if (!marketConfiguration) return;

    switch (action) {
      case ACTION_TYPE.SUPPLY: {
        if (actionTokenAssetId === marketConfiguration.baseToken.bits) {
          supplyBase(tokenAmount);
        } else {
          supplyCollateral(tokenAmount);
        }
        break;
      }
      case ACTION_TYPE.WITHDRAW: {
        if (!priceData) return;

        if (actionTokenAssetId === marketConfiguration.baseToken.bits) {
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
  };

  const handleModeChange = (action: ACTION_TYPE) => {
    changeAction(action);
  };

  const { data: balance } = useBalance({
    address: account ?? undefined,
    assetId: actionTokenAssetId ?? undefined,
  });

  const finalBalance = useMemo(() => {
    if (
      !collateralConfigurations ||
      !balance ||
      !marketConfiguration ||
      !actionTokenAssetId ||
      !userSupplyBorrow ||
      !priceData
    ) {
      return BigNumber(0);
    }

    if (action === 'REPAY') {
      // Repay 1 cent more than owed to avoid staying in debt

      return formatUnits(
        userSupplyBorrow.borrowed,
        marketConfiguration.baseTokenDecimals
      ).plus(
        BigNumber(0.001).div(
          priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
        )
      );
    }
    if (action === 'SUPPLY') {
      if (actionTokenAssetId === marketConfiguration.baseToken.bits) {
        return formatUnits(
          BigNumber(balance.toString()),
          marketConfiguration.baseTokenDecimals
        );
      }

      if (!collateralConfigurations[actionTokenAssetId]) return BigNumber(0);

      return formatUnits(
        BigNumber(balance.toString()),
        collateralConfigurations[actionTokenAssetId].decimals
      );
    }
    if (action === 'WITHDRAW') {
      if (actionTokenAssetId === marketConfiguration.baseToken.bits) {
        return formatUnits(
          userSupplyBorrow.supplied,
          marketConfiguration.baseTokenDecimals
        );
      }

      return maxWithdrawableCollateral ?? BigNumber(0);
    }

    if (action === 'BORROW') {
      // Borrow $1 less than max borrowable amount to avoid "Trying to borrow more than the max borrowable amount" errors when prices change.
      return (
        borrowCapacity?.minus(
          BigNumber(1).div(
            priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
          )
        ) ?? BigNumber(0)
      );
    }

    return BigNumber(0);
  }, [
    balance,
    actionTokenAssetId,
    action,
    marketConfiguration,
    collateralConfigurations,
    maxWithdrawableCollateral,
    borrowCapacity,
    userSupplyBorrow,
    priceData,
  ]);

  const onMaxBtnClick = () => {
    if (
      userSupplyBorrow == null ||
      finalBalance == null ||
      marketBalanceOfBase == null ||
      !actionTokenAssetId ||
      !collateralConfigurations ||
      !marketConfiguration
    ) {
      return null;
    }

    const decimals =
      actionTokenAssetId === marketConfiguration.baseToken.bits
        ? marketConfiguration.baseTokenDecimals
        : collateralConfigurations[actionTokenAssetId].decimals;

    switch (action) {
      case ACTION_TYPE.SUPPLY: {
        changeTokenAmount(BigNumber(finalBalance.toFixed(decimals)));
        break;
      }
      case ACTION_TYPE.WITHDRAW:
        if (actionTokenAssetId === marketConfiguration.baseToken.bits) {
          changeTokenAmount(BigNumber(finalBalance.toFixed(decimals)));
        } else {
          changeTokenAmount(BigNumber(finalBalance.toFixed(decimals)));
        }
        break;
      case ACTION_TYPE.BORROW:
        if (marketBalanceOfBase.formatted.lt(finalBalance)) {
          changeTokenAmount(
            BigNumber(marketBalanceOfBase.formatted.toFixed(decimals))
          );
        } else {
          changeTokenAmount(BigNumber(finalBalance.toFixed(decimals)));
        }
        break;
      case ACTION_TYPE.REPAY: {
        if (userSupplyBorrow.borrowed.eq(0)) return;

        const usdcBalance = formatUnits(
          BigNumber(balance?.toString() ?? 0),
          marketConfiguration.baseTokenDecimals
        );

        if (finalBalance.lte(usdcBalance)) {
          changeTokenAmount(BigNumber(finalBalance.toFixed(decimals)));
        } else {
          changeTokenAmount(usdcBalance);
        }
        break;
      }
    }
  };

  const { data: actionTokenBalance } = useBalance({
    address: account ?? undefined,
    assetId: actionTokenAssetId ?? undefined,
  });

  const { data: baseTokenBalance } = useBalance({
    address: account ?? undefined,
    assetId: marketConfiguration?.baseToken.bits,
  });

  const tokenInputError = (): string | null => {
    if (
      actionTokenAssetId == null ||
      borrowCapacity == null ||
      marketConfiguration == null ||
      !userSupplyBorrow ||
      baseTokenBalance == null ||
      userCollateralAssets == null ||
      actionTokenBalance == null ||
      !priceData
    ) {
      return null;
    }

    if (tokenAmount == null || tokenAmount.eq(0)) return null;

    if (action === ACTION_TYPE.SUPPLY) {
      let balance = BigNumber(0);
      if (actionTokenAssetId === marketConfiguration?.baseToken.bits) {
        balance = formatUnits(
          BigNumber(actionTokenBalance.toString()),
          marketConfiguration?.baseTokenDecimals
        );
      } else {
        balance = formatUnits(
          BigNumber(actionTokenBalance.toString()),
          collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals
        );
        const collateralBalance =
          collateralBalances?.get(actionTokenAssetId) ?? BigNumber(0);
        const supplyCapLeft = formatUnits(
          BigNumber(
            collateralConfigurations?.[
              actionTokenAssetId ?? ''
            ]?.supply_cap.toString() ?? '0'
          ).minus(collateralBalance),
          collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals
        );

        if (supplyCapLeft.eq(0)) return 'Supply cap reached';
        if (supplyCapLeft.minus(tokenAmount).lt(0)) {
          return 'Amount is higher than the supply cap available';
        }
      }
      if (balance == null) return null;
      if (balance.lt(tokenAmount)) return 'Insufficient balance';
    }

    if (action === ACTION_TYPE.WITHDRAW) {
      if (actionTokenAssetId === marketConfiguration?.baseToken.bits) {
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
        return `There is no ${appConfig.assets[marketConfiguration?.baseToken.bits]} to borrow`;
      }

      if (marketBalanceOfBase?.formatted.lt(tokenAmount)) {
        return `There is not enough ${appConfig.assets[marketConfiguration?.baseToken.bits]} to borrow`;
      }

      const minMarketBorrowPosition = BigNumber(
        marketConfiguration.baseBorrowMin.toString()
      ).dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

      const newBorrowPosition = userSupplyBorrow.borrowed
        .dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals))
        .plus(tokenAmount)
        .minus(
          userSupplyBorrow.supplied.dividedBy(
            BigNumber(10).pow(marketConfiguration.baseTokenDecimals)
          )
        );

      if (newBorrowPosition.lt(minMarketBorrowPosition)) {
        const amountToAchieveMinMarketBorrowPosition = minMarketBorrowPosition
          .plus(
            userSupplyBorrow.supplied.dividedBy(
              BigNumber(10).pow(marketConfiguration.baseTokenDecimals)
            )
          )
          .toFixed();

        return `Minimum borrow position is ${minMarketBorrowPosition.toFixed(0)} ${appConfig.assets[marketConfiguration.baseToken.bits]}. You need to borrow at least ${amountToAchieveMinMarketBorrowPosition} ${appConfig.assets[marketConfiguration.baseToken.bits]}.`;
      }

      if (
        tokenAmount.gt(
          borrowCapacity?.minus(
            BigNumber(0.99).div(
              priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
            )
          ) ?? BigNumber(0)
        )
      ) {
        return 'You do not have enough collateral to borrow this amount. Deposit more collateral to proceed!';
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

      const userBorrowed = formatUnits(
        userSupplyBorrow.borrowed,
        marketConfiguration?.baseTokenDecimals
      );

      const userBorrowedModified =
        userBorrowed.plus(
          BigNumber(0.002).div(
            priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
          )
        ) ?? BigNumber(0);

      const userBorrowedModifiedRepay =
        userBorrowed
          .plus(
            BigNumber(0.001).div(
              priceData?.prices[marketConfiguration.baseToken.bits] ?? 1
            )
          )
          .decimalPlaces(marketConfiguration?.baseTokenDecimals) ??
        BigNumber(0);

      const minOpenPositionValue = BigNumber(
        marketConfiguration.baseBorrowMin.toString()
      ).dividedBy(BigNumber(10).pow(marketConfiguration.baseTokenDecimals));

      if (
        userBorrowedModifiedRepay.minus(tokenAmount).lt(minOpenPositionValue) &&
        userBorrowedModifiedRepay.minus(tokenAmount).gt(0)
      ) {
        return `Your position cannot be less than ${minOpenPositionValue.toFixed()} ${SYMBOL_TO_NAME[appConfig.assets[marketConfiguration.baseToken.bits]]}. Please repay whole position or leave a position of at least ${minOpenPositionValue.toFixed()} ${SYMBOL_TO_NAME[appConfig.assets[marketConfiguration.baseToken.bits]]} open.`;
      }

      if (tokenAmount.gt(userBorrowedModified))
        return 'You are trying to repay more than your debt';
    }

    return null;
  };

  const availableBalance = useMemo(() => {
    if (
      !collateralConfigurations ||
      !marketConfiguration ||
      !actionTokenAssetId
    )
      return '0.00';
    if (finalBalance.lte(0)) return '0.00';

    if (actionTokenAssetId === marketConfiguration.baseToken.bits) {
      return finalBalance.toFixed(marketConfiguration.baseTokenDecimals);
    }
    return finalBalance.toFixed(
      collateralConfigurations?.[actionTokenAssetId ?? '']?.decimals
    );
  }, [finalBalance, marketConfiguration, collateralConfigurations]);

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
      // Supply collateral/withdraw
      if (
        actionTokenAssetId !== marketConfiguration?.baseToken.bits &&
        (!account || balance?.eq(0))
      ) {
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
    action,
    account,
    borrowCapacity,
    balance,
    marketConfiguration,
    actionTokenAssetId,
  ]);

  const disabledRightTab = useMemo(() => {
    if (action === ACTION_TYPE.SUPPLY || action === ACTION_TYPE.WITHDRAW) {
      // Lend/Withdraw
      if (actionTokenAssetId === marketConfiguration?.baseToken.bits) {
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
    action,
  ]);

  if (!marketConfiguration) return null;

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
                    action === ACTION_TYPE.BORROW ||
                      action === ACTION_TYPE.REPAY
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
                <div
                  className={`text-sm ${action === ACTION_TYPE.REPAY ? 'text-lavender' : 'text-moon'}`}
                >
                  {availableBalance}
                  {action === ACTION_TYPE.BORROW && ' available to borrow'}
                  {action === ACTION_TYPE.REPAY && ' debt to repay'}
                  {(action === ACTION_TYPE.SUPPLY ||
                    action === ACTION_TYPE.WITHDRAW) &&
                    ' available'}

                  <div className="text-moon">
                    {action === ACTION_TYPE.REPAY &&
                      `${getFormattedNumber(formatUnits(BigNumber(balance?.toString() ?? 0), marketConfiguration?.baseTokenDecimals))} available`}
                  </div>
                </div>
                <Button
                  disabled={!finalBalance || finalBalance.lte(0)}
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
                disabled={
                  error !== null || tokenAmount.eq(0) || isAnyActionPending
                }
                onMouseDown={handleSubmit}
                className="w-1/2 flex items-center gap-x-2"
              >
                {action &&
                  `${action.slice(0, 1)}${action.slice(1).toLowerCase()}`}
                {isAnyActionPending && (
                  <LoaderCircleIcon className="animate-spin w-4 h-4" />
                )}
              </Button>
            </div>
            {!isLending && (
              <div className="w-full flex justify-center">
                <PositionSummary />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
