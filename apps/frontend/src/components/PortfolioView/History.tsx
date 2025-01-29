import React from 'react';
import { InfoIcon } from '../InfoIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export const History = () => {
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
            Type
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            <div className="flex gap-x-1 items-center">
              Asset
              <InfoIcon text="Assets that can be used as Collateral in this market." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            <div className="flex gap-x-1 items-center">
              TX ID
              <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
            </div>
          </TableHead>
          <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
            <div className="flex gap-x-1 items-center">
              Time
              <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={8}>
            <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
              No Transactions
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
