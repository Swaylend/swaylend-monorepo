import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AssetName } from '@/components/v2/asset-name';
import { appConfig } from '@/configs';
import {
  useCollateralConfigurations,
  useCollateralReserves,
  usePriceData,
  useTotalCollateral,
} from '@/hooks/v2';
import {
  formatUnits,
  getFormattedNumber,
  getFormattedPrice,
  SYMBOL_TO_ICON,
  SYMBOL_TO_NAME,
} from '@/utils';
import { InfoIcon } from '../info-icon';

type TableRowProps = {
  assetId: string;

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
          name={SYMBOL_TO_NAME[symbol]}
          src={SYMBOL_TO_ICON[symbol]}
          symbol={symbol}
        />
      </TableCell>
      <TableCell className="font-medium text-lavender">
        <div className="flex items-center gap-x-2 text-moon">
          <span className="font-medium text-lavender">
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
      <TableCell className="font-medium text-lavender">
        {getFormattedPrice(
          formatUnits(reserves ?? BigNumber(0), decimals).times(price)
        )}
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {price.toFixed(2).toString()} $
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {formatUnits(collateralFactor, 16).toString()}%
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {formatUnits(liquidationFactor, 16).toString()}%
      </TableCell>
      <TableCell className="font-medium text-lavender">
        {BigNumber(100).minus(formatUnits(liquidationPenalty, 16)).toString()}%
      </TableCell>
    </TableRow>
  );
};

export const MarketCollateralsTable = ({
  marketName,
}: {
  marketName: string;
}) => {
  const { data: collateralConfigurations } =
    useCollateralConfigurations(marketName);

  const collaterals = useMemo(() => {
    if (!collateralConfigurations) return [];

    return Object.values(collateralConfigurations);
  }, [collateralConfigurations]);
  const { data: totalCollateral } = useTotalCollateral(marketName);

  const { data: priceData } = usePriceData(marketName);

  return (
    <div className="w-full rounded-lg border bg-linear-to-b from-white/10 to-card">
      <Table className="max-sm:hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="h-[75px] rounded-t-md" colSpan={7}>
              <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-lg">
                <div className="h-px w-[260px] rounded-full bg-linear-to-r from-white/0 to-primary" />
                <div className="text-center text-white">Collateral Assets</div>
                <div className="h-px w-[260px] rounded-full bg-linear-to-l from-white/0 to-primary" />
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="h-[60px] w-1/4 bg-card font-bold">
              Collateral Asset
            </TableHead>
            <TableHead className="h-[60px] w-1/8 bg-card font-bold">
              <div className="flex items-center gap-x-1">
                Total Supply <InfoIcon text="Total value of supplied asset." />
              </div>
            </TableHead>
            <TableHead className="h-[60px] w-1/8 bg-card font-bold">
              <div className="flex items-center gap-x-1">
                Reserves{' '}
                <InfoIcon text="Total value of this asset in reserves." />
              </div>
            </TableHead>
            <TableHead className="h-[60px] w-1/8 bg-card font-bold">
              Oracle Price
            </TableHead>
            <TableHead className="h-[60px] w-1/8 bg-card font-bold">
              <div className="flex items-center gap-x-1">
                Collateral Factor{' '}
                <InfoIcon text="The portion of the Collateral that can be borrowed against. Collateral factor of 80% means that for every $100 of Collateral, user can borrow $80." />
              </div>
            </TableHead>
            <TableHead className="h-[60px] w-1/8 bg-card font-bold">
              <div className="flex items-center gap-x-1">
                Liquidation Factor{' '}
                <InfoIcon text="The level at which a borrower can have their collateral liquidated." />
              </div>
            </TableHead>
            <TableHead className="h-[60px] w-1/8 bg-card font-bold">
              <div className="flex items-center gap-x-1">
                Liquidation Penalty{' '}
                <InfoIcon text="The fee a user pays to the protocol for being liquidated." />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaterals.map((collateral) => (
            <MarketCollateralsTableRow
              assetId={collateral.asset_id.bits}
              collateralFactor={BigNumber(
                collateral.borrow_collateral_factor.toString()
              )}
              decimals={collateral.decimals}
              key={collateral.asset_id.bits}
              liquidationFactor={BigNumber(
                collateral.liquidate_collateral_factor.toString()
              )}
              liquidationPenalty={BigNumber(
                collateral.liquidation_penalty.toString()
              )}
              price={
                priceData?.prices.get(collateral.asset_id.bits)?.[0]?.price ??
                BigNumber(0)
              }
              symbol={appConfig.client.shared.assets[collateral.asset_id.bits]}
              totalSupply={totalCollateral?.get(collateral.asset_id.bits)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
