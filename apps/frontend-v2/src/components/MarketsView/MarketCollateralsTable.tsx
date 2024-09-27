import { AssetName } from '@/components/AssetName';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCollateralConfigurations,
  useCollateralReserves,
  useMarketConfiguration,
  usePrice,
  useTotalCollateral,
} from '@/hooks';
import {
  ASSET_ID_TO_SYMBOL,
  type DeployedMarket,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
  formatUnits,
  getFormattedNumber,
  getFormattedPrice,
} from '@/utils';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';

type TableRowProps = {
  assetId: string;
  baseAsset: {
    symbol: string;
    decimals: number;
  };
  symbol: string;
  decimals: number;
  totalSupply: BigNumber | undefined;
  price: BigNumber;
  collateralFactor: BigNumber;
  liquidationFactor: BigNumber;
  liquidationPenalty: BigNumber;
};

const MarketCollateralsTableRow = ({
  assetId,
  baseAsset,
  symbol,
  decimals,
  totalSupply,
  price,
  collateralFactor,
  liquidationFactor,
  liquidationPenalty,
}: TableRowProps) => {
  const { data: reserves } = useCollateralReserves(assetId) ?? BigNumber(0);

  return (
    <TableRow>
      <TableCell>
        <AssetName
          symbol={symbol}
          name={SYMBOL_TO_NAME[symbol]}
          src={SYMBOL_TO_ICON[symbol]}
        />
      </TableCell>
      <TableCell className="text-lavender font-medium">
        <div className=" text-moon flex items-center gap-x-2">
          <span className="text-lavender font-medium">
            {getFormattedPrice(
              formatUnits(totalSupply ?? BigNumber(0), decimals).times(price)
            )}
          </span>
          {getFormattedNumber(
            formatUnits(totalSupply ?? BigNumber(0), decimals)
          )}{' '}
          {symbol}
        </div>
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {getFormattedPrice(
          formatUnits(reserves ?? BigNumber(0), baseAsset.decimals)
        )}
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {price.toFixed(2).toString()} $
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {formatUnits(collateralFactor, 16).toString()}%
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {formatUnits(liquidationFactor, 16).toString()}%
      </TableCell>
      <TableCell className="text-lavender font-medium">
        {BigNumber(100).minus(formatUnits(liquidationPenalty, 16)).toString()}%
      </TableCell>
    </TableRow>
  );
};

export const MarketCollateralsTable = ({
  marketName,
}: { marketName: string }) => {
  const { data: collateralConfigurations } = useCollateralConfigurations(
    marketName as DeployedMarket
  );
  const { data: marketConfiguration } = useMarketConfiguration(
    marketName as DeployedMarket
  );

  // if (marketName === 'USDT') {
  //   console.log('collateralConfigurations', collateralConfigurations);
  // }

  const collaterals = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations);
  }, [collateralConfigurations]);
  const { data: totalCollateral } = useTotalCollateral(
    marketName as DeployedMarket
  );

  // if (marketName === 'USDT') {
  //   totalCollateral?.forEach((value, key) => {
  //     console.log('totalCollateral', key, value.toFixed(2));
  //   });
  // }

  const { data: priceData } = usePrice(marketName as DeployedMarket);

  return (
    <div className="w-full border bg-gradient-to-b from-white/10 to-card rounded-lg ">
      <Table className="max-sm:hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="h-[75px] rounded-t-md" colSpan={7}>
              <div className="w-full items-center justify-center gap-x-2 font-semibold text-lg flex">
                <div className="w-[260px] rounded-full h-[1px] bg-gradient-to-r from-white/0 to-primary" />
                <div className="text-center text-white">Collateral Assets</div>
                <div className="w-[260px] rounded-full h-[1px] bg-gradient-to-l from-white/0 to-primary" />
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="w-1/4 bg-card h-[60px] font-bold">
              Collateral Asset
            </TableHead>
            <TableHead className="w-1/8 bg-card h-[60px] font-bold ">
              Total Supply
            </TableHead>
            <TableHead className="w-1/8 bg-card h-[60px] font-bold">
              Reserves
            </TableHead>
            <TableHead className="w-1/8 bg-card h-[60px] font-bold">
              Oracle Price
            </TableHead>
            <TableHead className="w-1/8 bg-card h-[60px] font-bold">
              Collateral Factor
            </TableHead>
            <TableHead className="w-1/8 bg-card h-[60px] font-bold">
              Liquidation Factor
            </TableHead>
            <TableHead className="w-1/8 bg-card h-[60px] font-bold">
              Liquidation Penalty
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaterals.map((collateral) => (
            <MarketCollateralsTableRow
              key={collateral.asset_id.bits}
              assetId={collateral.asset_id.bits}
              baseAsset={{
                symbol:
                  ASSET_ID_TO_SYMBOL[marketConfiguration?.baseToken.bits!],
                decimals: marketConfiguration?.baseTokenDecimals ?? 6,
              }}
              symbol={ASSET_ID_TO_SYMBOL[collateral.asset_id.bits]}
              decimals={collateral.decimals}
              totalSupply={totalCollateral?.get(collateral.asset_id.bits)}
              price={
                priceData?.prices[collateral.asset_id.bits] ?? BigNumber(0)
              }
              collateralFactor={BigNumber(
                collateral.borrow_collateral_factor.toString()
              )}
              liquidationFactor={BigNumber(
                collateral.liquidate_collateral_factor.toString()
              )}
              liquidationPenalty={BigNumber(
                collateral.liquidation_penalty.toString()
              )}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
