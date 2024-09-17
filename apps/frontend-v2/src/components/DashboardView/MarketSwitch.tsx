import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserSupplyBorrow } from '@/hooks';
import { useMarketStore } from '@/stores';
import { useIsConnected } from '@fuels/react';
import React from 'react';

export const MarketSwitch = () => {
  const { marketMode, changeMarketMode } = useMarketStore();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { isConnected } = useIsConnected();

  const handleChange = (value: any) => {
    changeMarketMode(value);
  };

  return (
    <Tabs
      onValueChange={handleChange}
      defaultValue={marketMode}
      className="mt-[40px] sm:mt-[55px]"
    >
      <TabsList className="max-sm:h-[40px]">
        <TabsTrigger value="borrow" className="max-sm:py-1.5 max-sm:px-6">
          Borrow
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white max-sm:py-1 max-sm:px-6"
          value="lend"
          disabled={
            isConnected &&
            userSupplyBorrow !== null &&
            userSupplyBorrow?.borrowed.gt(0)
          }
        >
          Earn
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
