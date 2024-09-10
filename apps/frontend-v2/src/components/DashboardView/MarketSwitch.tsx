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
      className="mt-[40px] sm:mt-[55px]"
    >
      <TabsList className="max-sm:h-[40px]">
        <TabsTrigger value="lend" className="max-sm:py-1 max-sm:px-6">
          Lend
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-neutral2 max-sm:py-1 max-sm:px-6"
          value="borrow"
        >
          Borrow
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
