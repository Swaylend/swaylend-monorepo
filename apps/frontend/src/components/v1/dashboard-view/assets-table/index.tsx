import { MarketSwitcher } from '@/components/v1/market-switcher';
import { useMarketStore } from '@/stores/market-store';
import { BorrowTable } from './borrow-table';
import { CollateralTable } from './collateral-table';
import { LendTable } from './lend-table';

export const AssetsTable = () => {
  const marketMode = useMarketStore.use.marketMode();

  return (
    <div className="w-full mt-[15px] sm:mt-[20px]">
      <div className="py-2 max-w-[200px]">
        <MarketSwitcher />
      </div>
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
