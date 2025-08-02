import Image from 'next/image';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appConfig } from '@/configs';
import FUEL from '/public/icons/fuel-logo.svg?url';
import { InfoIcon } from '../info-icon';
import { MarketTableRow } from './market-table-row';

export const MarketsTable = () => {
  return (
    <Table className="max-lg:hidden">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="flex w-full items-center justify-center gap-x-2 font-semibold text-white">
              <div>
                <Image alt={'fuel logo'} height={24} src={FUEL} />
              </div>
              Fuel Network
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            Market
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            <div className="flex items-center gap-x-1">
              Collateral Assets{' '}
              <InfoIcon text="Assets that can be used as Collateral in this market." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            <div className="flex items-center gap-x-1">
              Utilization{' '}
              <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            Net Earn APR
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            Net Borrow APR
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            <div className="flex items-center gap-x-1">
              Total Earning{' '}
              <InfoIcon text="Total value of Supplied Base Assets." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            <div className="flex items-center gap-x-1">
              Total Borrowing{' '}
              <InfoIcon text="Total value of Base Assets that are Borrowed." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] bg-card pt-4 font-bold text-primary">
            <div className="flex items-center gap-x-1">
              Total Collateral{' '}
              <InfoIcon text="Total value of Supplied Collateral Assets." />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.keys(appConfig.client.v2.markets).map((marketName) => {
          return <MarketTableRow key={marketName} marketName={marketName} />;
        })}
      </TableBody>
    </Table>
  );
};
