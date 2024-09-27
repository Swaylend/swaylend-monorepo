import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketStore } from '@/stores';
import React from 'react';

export const MarketSwitch = () => {
  const { marketMode, changeMarketMode } = useMarketStore();

  const handleChange = (value: any) => {
    changeMarketMode(value);
  };

  return (
    <Tabs
      onValueChange={handleChange}
      defaultValue={marketMode}
      className="mt-[40px] sm:mt-[55px] block lg:hidden"
    >
      <TabsList className="max-sm:h-[40px]">
        <TabsTrigger value="borrow" className="max-sm:py-1.5 max-sm:px-6">
          Borrow
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:bg-purple data-[state=active]:text-white max-sm:py-1 max-sm:px-6"
          value="lend"
        >
          Earn
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
