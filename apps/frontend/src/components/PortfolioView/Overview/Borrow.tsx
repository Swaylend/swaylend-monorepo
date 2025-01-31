import { CollateralIcons } from '@/components/CollateralIcons';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/configs';
import {
  useApr,
  useCollateralConfigurations,
  useMarketConfiguration,
  usePrice,
  useUserCollateralAssets,
  useUserCollateralUtilization,
  useUserSupplyBorrow,
} from '@/hooks';
import {
  ACTION_TYPE,
  MARKET_MODE,
  selectChangeAction,
  selectChangeActionTokenAssetId,
  selectChangeInputDialogOpen,
  selectChangeMarket,
  selectChangeMarketMode,
  selectChangeTokenAmount,
  useMarketStore,
} from '@/stores';
import {
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
  getFormattedPrice,
} from '@/utils';
import BigNumber from 'bignumber.js';
import { MoveUpRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { InfoIcon } from '../../InfoIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';

export const Borrow = () => {
  const {
    data: userSupplyBorrowUSDC,
    isPending: isPendingUserSupplyBorrowUSDC,
  } = useUserSupplyBorrow('USDC');
  const {
    data: userSupplyBorrowUSDT,
    isPending: isPendingUserSupplyBorrowUSDT,
  } = useUserSupplyBorrow('USDT');
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePrice('USDC');
  const { data: priceDataUSDT, isPending: isPendingPriceDataUSDT } =
    usePrice('USDT');
  const { data: aprDataUSDC, isPending: isAprPendingUSDC } = useApr('USDC');
  const { data: aprDataUSDT, isPending: isAprPendingUSDT } = useApr('USDT');

  const {
    data: marketConfigurationUSDC,
    isPending: isPendingMarketConfigurationUSDC,
  } = useMarketConfiguration('USDC');

  const {
    data: marketConfigurationUSDT,
    isPending: isPendingMarketConfigurationUSDT,
  } = useMarketConfiguration('USDT');

  const { data: collateralUtilizationUSDC, isPending: isPendingColUtilUSDC } =
    useUserCollateralUtilization('USDC');
  const { data: collateralUtilizationUSDT, isPending: isPendingColUtilUSDT } =
    useUserCollateralUtilization('USDT');

  const currentCollateralUtilizationUSDC = useMemo(() => {
    return Number(collateralUtilizationUSDC?.times(100).toFixed(2));
  }, [collateralUtilizationUSDC]);

  const currentCollateralUtilizationUSDT = useMemo(() => {
    return Number(collateralUtilizationUSDT?.times(100).toFixed(2));
  }, [collateralUtilizationUSDT]);

  const {
    data: userCollateralAssetsUSDC,
    isPending: isPendingUserCollateralAssetsUSDC,
  } = useUserCollateralAssets('USDC');

  const {
    data: userCollateralAssetsUSDT,
    isPending: isPendingUserCollateralAssetsUSDT,
  } = useUserCollateralAssets('USDT');

  const isLoading = useMemo(() => {
    return [
      isPendingMarketConfigurationUSDT,
      isPendingMarketConfigurationUSDC,
      isPendingUserSupplyBorrowUSDT,
      isPendingUserSupplyBorrowUSDC,
      isPendingPriceDataUSDC,
      isPendingPriceDataUSDT,
      isAprPendingUSDC,
      isAprPendingUSDT,
    ].some((res) => res);
  }, [
    isPendingMarketConfigurationUSDT,
    isPendingMarketConfigurationUSDC,
    isPendingUserSupplyBorrowUSDT,
    isPendingUserSupplyBorrowUSDC,
    isPendingPriceDataUSDC,
    isPendingPriceDataUSDT,
    isAprPendingUSDC,
    isAprPendingUSDT,
  ]);

  const borrowedUSDC = useMemo(() => {
    if (!userSupplyBorrowUSDC || !marketConfigurationUSDC) {
      return null;
    }
    const res = formatUnits(
      userSupplyBorrowUSDC.borrowed,
      marketConfigurationUSDC.baseTokenDecimals
    );

    if (res.eq(0)) {
      return null;
    }
    return res;
  }, [userSupplyBorrowUSDC, marketConfigurationUSDC]);

  const borrowedUSDT = useMemo(() => {
    if (!userSupplyBorrowUSDT || !marketConfigurationUSDT) {
      return null;
    }
    const res = formatUnits(
      userSupplyBorrowUSDT.borrowed,
      marketConfigurationUSDT.baseTokenDecimals
    );
    if (res.eq(0)) {
      return null;
    }
    return res;
  }, [userSupplyBorrowUSDT, marketConfigurationUSDT]);

  const borrowedUSDTPrice = useMemo(() => {
    if (!priceDataUSDT || !borrowedUSDT || !marketConfigurationUSDT) {
      return BigNumber(0);
    }
    return priceDataUSDT.prices[marketConfigurationUSDT?.baseToken.bits].times(
      borrowedUSDT
    );
  }, [priceDataUSDT, borrowedUSDT, marketConfigurationUSDT]);

  const borrowedUSDCPrice = useMemo(() => {
    if (!priceDataUSDC || !borrowedUSDC || !marketConfigurationUSDC) {
      return BigNumber(0);
    }
    return priceDataUSDC.prices[marketConfigurationUSDC?.baseToken.bits].times(
      borrowedUSDC
    );
  }, [priceDataUSDC, borrowedUSDC, marketConfigurationUSDC]);

  const collateralIconsUSDT = useMemo(() => {
    if (!userCollateralAssetsUSDT) return [];

    const assetIDs = Object.keys(userCollateralAssetsUSDT);

    return assetIDs
      .filter((assetId) => {
        if (userCollateralAssetsUSDT[assetId].isZero()) return false;
        return true;
      })
      .map((assetId) => {
        const symbol = appConfig.assets[assetId];
        return {
          id: symbol,
          name: symbol,
          description: '',
          icon: SYMBOL_TO_ICON[symbol],
        };
      });
  }, [userCollateralAssetsUSDT]);

  const collateralIconsUSDC = useMemo(() => {
    if (!userCollateralAssetsUSDC) return [];

    const assetIDs = Object.keys(userCollateralAssetsUSDC);

    return assetIDs
      .filter((assetId) => {
        if (userCollateralAssetsUSDC[assetId].isZero()) return false;
        return true;
      })
      .map((assetId) => {
        const symbol = appConfig.assets[assetId];
        return {
          id: symbol,
          name: symbol,
          description: '',
          icon: SYMBOL_TO_ICON[symbol],
        };
      });
  }, [userCollateralAssetsUSDC]);

  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeActionTokenAssetId = useMarketStore(
    selectChangeActionTokenAssetId
  );
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);
  const changeMarketMode = useMarketStore(selectChangeMarketMode);
  const changeMarket = useMarketStore(selectChangeMarket);

  const handleBaseTokenClick = (
    action: ACTION_TYPE,
    assetId: string,
    market: string
  ) => {
    changeAction(action);
    changeTokenAmount(BigNumber(0));
    changeMarketMode(MARKET_MODE.BORROW);
    changeActionTokenAssetId(assetId);
    changeInputDialogOpen(true);
    changeMarket(market);
  };

  return (
    <Table className="max-lg:hidden mt-12">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="w-full flex items-center justify-center gap-x-2 text-white font-semibold">
              Borrow Positions
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Market
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            <div className="flex gap-x-1 items-center">
              Collateral
              <InfoIcon text="Assets that can be used as Collateral in this market." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            <div className="flex gap-x-1 items-center">
              Borrow Value
              <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            <div className="flex gap-x-1 items-center">Liquidation Risk</div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Interest
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Rewards APY
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!borrowedUSDC && !borrowedUSDC ? (
          <TableRow>
            <TableCell colSpan={8}>
              <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                No Lend Positions Open.
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <>
            {borrowedUSDC && (
              <TableRow>
                <TableCell>
                  <div className="flex gap-x-2 items-center">
                    <div>
                      <Image
                        src={SYMBOL_TO_ICON.USDC}
                        alt={'USDC'}
                        width={32}
                        height={32}
                        className={'rounded-full'}
                      />
                    </div>
                    <div>
                      <div className="flex gap-x-2 items-baseline">
                        <div className="text-white text-md font-semibold">
                          {SYMBOL_TO_NAME.USDC}
                        </div>
                        <div className="text-sm font-semibold text-moon">
                          {'USDC'}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CollateralIcons collaterals={collateralIconsUSDC} />
                </TableCell>

                <TableCell>
                  <span className="text-lavender font-medium">
                    {getFormattedPrice(borrowedUSDCPrice)}
                  </span>{' '}
                  {borrowedUSDC.toFixed(2)} USDC
                </TableCell>
                <TableCell
                  className={`font-semibold bg-card ${currentCollateralUtilizationUSDC > 80 && 'text-red-500'} ${currentCollateralUtilizationUSDC > 60 && currentCollateralUtilizationUSDC <= 80 && 'text-yellow-500'} ${currentCollateralUtilizationUSDC <= 60 && 'text-primary'}`}
                >
                  {currentCollateralUtilizationUSDC}%
                </TableCell>
                <TableCell>
                  <div className="flex gap-x-2 items-center text-md font-medium text-white">
                    <div>
                      {aprDataUSDC?.borrowBaseApr.times(100).toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-x-1 items-center text-primary">
                    <Image
                      src={SYMBOL_TO_ICON.FUEL}
                      alt={'USDC'}
                      width={16}
                      height={16}
                      className={'rounded-full'}
                    />
                    <div>
                      {' '}
                      {aprDataUSDC?.borrowRewardApr.times(100).toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href="/">
                    <Button
                      onMouseDown={() => {
                        handleBaseTokenClick(
                          ACTION_TYPE.BORROW,
                          marketConfigurationUSDC?.baseToken.bits ?? '',
                          'USDC'
                        );
                      }}
                    >
                      <MoveUpRightIcon size={20} />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {borrowedUSDT && (
              <TableRow>
                <TableCell>
                  <div className="flex gap-x-2 items-center">
                    <div>
                      <Image
                        src={SYMBOL_TO_ICON.USDT}
                        alt={'USDT'}
                        width={32}
                        height={32}
                        className={'rounded-full'}
                      />
                    </div>
                    <div>
                      <div className="flex gap-x-2 items-baseline">
                        <div className="text-white text-md font-semibold">
                          {SYMBOL_TO_NAME.USDT}
                        </div>
                        <div className="text-sm font-semibold text-moon">
                          {'USDT'}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CollateralIcons collaterals={collateralIconsUSDT} />
                </TableCell>

                <TableCell>
                  <span className="text-lavender font-medium">
                    {getFormattedPrice(borrowedUSDTPrice)}
                  </span>{' '}
                  {borrowedUSDT.toFixed(2)} USDT
                </TableCell>
                <TableCell
                  className={`font-semibold bg-card ${currentCollateralUtilizationUSDT > 80 && 'text-red-500'} ${currentCollateralUtilizationUSDT > 60 && currentCollateralUtilizationUSDT <= 80 && 'text-yellow-500'} ${currentCollateralUtilizationUSDT <= 60 && 'text-primary'}`}
                >
                  {currentCollateralUtilizationUSDT}%
                </TableCell>
                <TableCell>
                  <div className="flex gap-x-2 items-center text-md font-medium text-white">
                    <div>
                      {aprDataUSDT?.borrowBaseApr.times(100).toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-x-1 items-center text-primary">
                    <Image
                      src={SYMBOL_TO_ICON.FUEL}
                      alt={'USDT'}
                      width={16}
                      height={16}
                      className={'rounded-full'}
                    />
                    <div>
                      {' '}
                      {aprDataUSDT?.borrowRewardApr.times(100).toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href="/">
                    <Button
                      onMouseDown={() => {
                        handleBaseTokenClick(
                          ACTION_TYPE.BORROW,
                          marketConfigurationUSDT?.baseToken.bits ?? '',
                          'USDT'
                        );
                      }}
                    >
                      <MoveUpRightIcon size={20} />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};
