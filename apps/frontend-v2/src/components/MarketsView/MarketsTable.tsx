import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEPLOYED_MARKETS, type DeployedMarket } from '@/utils';
import React from 'react';
import { MarketTableRow } from './MarketTableRow';

export const MarketsTable = () => {
  return (
    <Table className="max-lg:hidden">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={8}>
            <div className="w-full flex justify-center text-white font-semibold">
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
        {Object.entries(DEPLOYED_MARKETS).map(([marketName, _]) => {
          return (
            <MarketTableRow
              key={marketName}
              marketName={marketName as DeployedMarket}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};