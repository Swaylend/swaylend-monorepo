import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appConfig } from '@/configs';
import Image from 'next/image';
import React from 'react';
import FUEL from '/public/icons/fuel-logo.svg?url';
import { MarketTableRow } from './MarketTableRow';
import { InfoIcon } from '../InfoIcon';

export const MarketsTable = () => {
  return (
    <Table className="max-lg:hidden">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="w-full flex items-center justify-center gap-x-2 text-white font-semibold">
              <div>
                <Image src={FUEL} height={24} alt={'fuel logo'} />
              </div>
              Fuel Network
            </div>
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Market
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            <div className="flex gap-x-1 items-center">
              Collateral Assets{' '}
              <InfoIcon text="Assets that can be used as Collateral in this market." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            <div className="flex gap-x-1 items-center">
              Utilization{' '}
              <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Net Earn APR
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Net Borrow APR
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            <div className="flex gap-x-1 items-center">
              Total Earning{' '}
              <InfoIcon text="Total value of Supplied Base Assets." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            <div className="flex gap-x-1 items-center">
              Total Borrowing{' '}
              <InfoIcon text="Total value of Base Assets that are Borrowed." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            <div className="flex gap-x-1 items-center">
              Total Collateral{' '}
              <InfoIcon text="Total value of Supplied Collateral Assets." />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.keys(appConfig.markets).map((marketName) => {
          return <MarketTableRow key={marketName} marketName={marketName} />;
        })}
      </TableBody>
    </Table>
  );
};
