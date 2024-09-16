import { useMarketStore } from '@/stores';
import React from 'react';
import { BorrowTable } from './BorrowTable';
import { CollateralTable } from './CollateralTable';
import { LendTable } from './LendTable';

export const AssetsTable = () => {
  const { marketMode } = useMarketStore();

  return (
    <div className="w-full mt-[30px] sm:mt-[55px]">
      {marketMode === 'lend' && (
        <div className="flex flex-col">
          <LendTable />
        </div>
      )}
      {marketMode === 'borrow' && (
        <div>
          <BorrowTable />
          <CollateralTable />
        </div>
      )}
    </div>
  );
};
