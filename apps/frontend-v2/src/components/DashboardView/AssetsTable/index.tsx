import { useMarketStore } from '@/stores';
import React from 'react';
import { LendTable } from './LendTable';
import { CollateralTable } from './CollateralTable';
import { BorrowTable } from './BorrowTable';

export const AssetsTable = () => {
  const { market, marketMode } = useMarketStore();

  return (
    <div className="w-full">
      {marketMode === 'lend' && (
        <div className="flex flex-col gap-y-4">
          <LendTable />
          <CollateralTable />
        </div>
      )}
      {marketMode === 'borrow' && (
        <div>
          <BorrowTable />
        </div>
      )}
    </div>
  );
};
