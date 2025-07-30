import { MarketSwitcher } from '@/components/v2/market-switcher';
import { useMarketStore } from '@/stores/market-store';
import { BorrowTable } from './borrow-table';
import { CollateralTable } from './collateral-table';
import { LendTable } from './lend-table';

export const AssetsTable = () => {
  const marketMode = useMarketStore.use.marketMode();

  return (
    <div className="mt-[15px] w-full sm:mt-[20px]">
      <div className="max-w-[200px] py-2">
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
