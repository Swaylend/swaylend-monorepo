import React from 'react';
import { InfoIcon } from '../../InfoIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Liquidity } from './Liquidity';

export const Overview = () => {
  return (
    <div>
      <Liquidity />

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
              <div className="flex gap-x-1 items-center">
                Assets
                <InfoIcon text="Assets that can be used as Collateral in this market." />
              </div>
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              <div className="flex gap-x-1 items-center">
                Liquidation Risk
                <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
              </div>
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              <div className="flex gap-x-1 items-center">
                APY
                <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
              </div>
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Total Rewards
            </TableHead>
            <TableHead className="h-[64px] pt-4 text-moon font-semibold bg-card">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8}>
              <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                No Collateral Supplied.
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

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
              <div className="flex gap-x-1 items-center">
                Debt
                <InfoIcon text="Percentage of Supplied Base Assets that is being borrowed." />
              </div>
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
          <TableRow>
            <TableCell colSpan={8}>
              <div className="w-full text-md font-semibold text-moon flex justify-center items-center">
                No Borrow Positions Open.
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
