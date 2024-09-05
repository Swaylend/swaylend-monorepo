import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketStore } from '@/stores';

export const MarketSwitch = () => {
  const { marketMode, changeMarketMode } = useMarketStore();

  const handleChange = (value: any) => {
    changeMarketMode(value);
  };

  return (
    <Tabs
      onValueChange={handleChange}
      defaultValue={marketMode}
      className="my-8"
    >
      <TabsList className="">
        <TabsTrigger value="lend">Lend</TabsTrigger>
        <TabsTrigger value="borrow">Borrow</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
