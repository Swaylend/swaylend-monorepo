import { AssetName } from '@/components/AssetName';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { appConfig } from '@/configs';
import {
  useApr,
  useCollateralConfigurations,
  usePrice,
  useUserCollateralAssets,
  useUserCollateralUtilization,
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

type TableRowProps = {
  market: string;
  assetId: string;
  value: string;
  amount: BigNumber;
  apy: any;
  liquidationRisk: number;
};

const CollateralTableRow = ({
  market,
  assetId,
  value,
  amount,
  apy,
  liquidationRisk,
}: TableRowProps) => {
  const symbol = appConfig.assets[assetId];

  const changeAction = useMarketStore(selectChangeAction);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeActionTokenAssetId = useMarketStore(
    selectChangeActionTokenAssetId
  );
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);
  const changeMarketMode = useMarketStore(selectChangeMarketMode);
  const changeMarket = useMarketStore(selectChangeMarket);

  const handleCollateralTokenClick = (
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
    <TableRow>
      <TableCell className="text-white font-semibold bg-card">
        <div className="flex gap-x-2 items-center">
          <div>
            <Image
              src={SYMBOL_TO_ICON[market]}
              alt={market}
              width={32}
              height={32}
              className={'rounded-full'}
            />
          </div>
          <div>
            <div className="flex gap-x-2 items-baseline">
              <div className="text-white text-md font-semibold">
                {SYMBOL_TO_NAME[market]}
              </div>
              <div className="text-sm font-semibold text-moon">{market}</div>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <AssetName
          symbol={symbol}
          name={SYMBOL_TO_NAME[symbol]}
          src={SYMBOL_TO_ICON[symbol]}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-x-2 items-center">
          <span className="text-lavender font-medium">{value}</span>
          <span>
            {amount.toFixed(2)} {symbol}
          </span>
        </div>
      </TableCell>
      <TableCell
        className={`font-semibold bg-card ${liquidationRisk > 80 && 'text-red-500'} ${liquidationRisk > 60 && liquidationRisk <= 80 && 'text-yellow-500'} ${liquidationRisk <= 60 && 'text-primary'}`}
      >
        {liquidationRisk}%
      </TableCell>
      <TableCell className="text-white font-semibold bg-card">
        <div className="flex gap-x-1 items-center text-primary">
          <Image
            src={SYMBOL_TO_ICON.FUEL}
            alt={'FUEL'}
            width={16}
            height={16}
            className={'rounded-full'}
          />
          <div> {apy?.borrowRewardApr.times(100).toFixed(2)}%</div>
        </div>
      </TableCell>
      <TableCell className="text-white font-semibold bg-card">
        <Link href="/">
          <Button
            onMouseDown={() => {
              handleCollateralTokenClick(ACTION_TYPE.WITHDRAW, assetId, market);
            }}
          >
            <MoveUpRightIcon size={20} />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
};

const SkeletonRow = (
  <TableRow>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
    <TableCell>
      <Skeleton className="w-full h-[40px] bg-primary/20 rounded-md" />
    </TableCell>
  </TableRow>
);

export const Collateral = () => {
  const { data: priceDataUSDC, isPending: isPendingPriceDataUSDC } =
    usePrice('USDC');
  const { data: priceDataUSDT, isPending: isPendingPriceDataUSDT } =
    usePrice('USDT');

  const {
    data: userCollateralAssetsUSDC,
    isPending: isPendingUserCollateralAssetsUSDC,
  } = useUserCollateralAssets('USDC');
  const {
    data: colateralConfigurationsUSDC,
    isPending: isPendingCollateralConfigurationsUSDC,
  } = useCollateralConfigurations('USDC');

  const {
    data: userCollateralAssetsUSDT,
    isPending: isPendingUserCollateralAssetsUSDT,
  } = useUserCollateralAssets('USDT');

  const {
    data: colateralConfigurationsUSDT,
    isPending: isPendingCollateralConfigurationsUSDT,
  } = useCollateralConfigurations('USDT');

  const { data: aprDataUSDC, isPending: isAprPendingUSDC } = useApr('USDC');
  const { data: aprDataUSDT, isPending: isAprPendingUSDT } = useApr('USDT');

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

  const isLoading = useMemo(() => {
    return [
      isPendingCollateralConfigurationsUSDT,
      isPendingUserCollateralAssetsUSDT,
      isPendingCollateralConfigurationsUSDC,
      isPendingUserCollateralAssetsUSDC,
      isPendingPriceDataUSDC,
      isPendingPriceDataUSDT,
      isAprPendingUSDC,
      isAprPendingUSDT,
      isPendingColUtilUSDC,
      isPendingColUtilUSDT,
    ].some((x) => x);
  }, [
    isPendingCollateralConfigurationsUSDT,
    isPendingUserCollateralAssetsUSDT,
    isPendingCollateralConfigurationsUSDC,
    isPendingUserCollateralAssetsUSDC,
    isPendingPriceDataUSDC,
    isPendingPriceDataUSDT,
    isAprPendingUSDC,
    isAprPendingUSDT,
    isPendingColUtilUSDC,
    isPendingColUtilUSDT,
  ]);

  const suppliedCollateralsUSDT = useMemo(() => {
    if (
      !priceDataUSDT ||
      !userCollateralAssetsUSDT ||
      !colateralConfigurationsUSDT
    )
      return [];

    const assetIDs = Object.keys(userCollateralAssetsUSDT);

    return assetIDs
      .filter((assetId) => {
        if (userCollateralAssetsUSDT[assetId].isZero()) return false;
        return true;
      })
      .map((assetId) => {
        const amount = formatUnits(
          userCollateralAssetsUSDT[assetId],
          colateralConfigurationsUSDT[assetId].decimals
        );
        const market = 'USDT';
        const value = getFormattedPrice(
          priceDataUSDT.prices[assetId].times(amount)
        );
        return { market, assetId, value, amount };
      });
  }, [priceDataUSDT, userCollateralAssetsUSDT, colateralConfigurationsUSDT]);

  const suppliedCollateralsUSDC = useMemo(() => {
    if (
      !priceDataUSDC ||
      !userCollateralAssetsUSDC ||
      !colateralConfigurationsUSDC
    )
      return [];

    const assetIDs = Object.keys(userCollateralAssetsUSDC);

    return assetIDs
      .filter((assetId) => {
        if (userCollateralAssetsUSDC[assetId].isZero()) return false;
        return true;
      })
      .map((assetId) => {
        const amount = formatUnits(
          userCollateralAssetsUSDC[assetId],
          colateralConfigurationsUSDC[assetId].decimals
        );
        const market = 'USDC';
        const value = getFormattedPrice(
          priceDataUSDC.prices[assetId].times(amount)
        );
        return { market, assetId, value, amount };
      });
  }, [priceDataUSDC, userCollateralAssetsUSDC, colateralConfigurationsUSDC]);

  return (
    <Table className="max-lg:hidden mt-12">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="w-full flex items-center justify-center gap-x-2 text-white font-semibold">
              Collateral
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Market
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Collateral Asset
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Assets
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            Liquidation Risk
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
        {isLoading ? (
          <>{SkeletonRow}</>
        ) : (
          <>
            {suppliedCollateralsUSDT.length === 0 &&
              suppliedCollateralsUSDC.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                      No Collateral Supplied.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            {suppliedCollateralsUSDT.map((collateral) => (
              <CollateralTableRow
                key={collateral.assetId}
                market={collateral.market}
                assetId={collateral.assetId}
                amount={collateral.amount}
                value={collateral.value}
                apy={aprDataUSDT}
                liquidationRisk={currentCollateralUtilizationUSDT}
              />
            ))}
            {suppliedCollateralsUSDC.map((collateral) => (
              <CollateralTableRow
                key={collateral.assetId}
                market={collateral.market}
                assetId={collateral.assetId}
                amount={collateral.amount}
                value={collateral.value}
                apy={aprDataUSDC}
                liquidationRisk={currentCollateralUtilizationUSDC}
              />
            ))}
          </>
        )}
      </TableBody>
    </Table>
  );
};
