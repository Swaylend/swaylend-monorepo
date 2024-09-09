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
      className="mt-[55px]"
    >
      <TabsList className="">
        <TabsTrigger value="lend">Lend</TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-neutral2"
          value="borrow"
        >
          Borrow
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
