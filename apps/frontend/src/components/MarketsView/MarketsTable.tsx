import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appConfig } from '@/configs';
import React from 'react';
import FUEL from '/public/icons/fuel-logo.svg?url';
import { MarketTableRow } from './MarketTableRow';
import Image from 'next/image';

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
            Collateral Assets
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Utilization
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Net Earn APR
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Net Borrow APR
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Total Earning
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Total Borrowing
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-primary font-bold bg-card">
            Total Collateral
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
