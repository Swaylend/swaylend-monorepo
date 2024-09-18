import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketConfiguration, useUserSupplyBorrow } from '@/hooks';
import { useMarketStore } from '@/stores';
import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import React from 'react';

export const MarketSwitch = () => {
  const { marketMode, changeMarketMode } = useMarketStore();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { isConnected } = useIsConnected();
  const { data: marketConfiguration } = useMarketConfiguration();

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
            userSupplyBorrow != null &&
            marketConfiguration != null &&
            userSupplyBorrow.borrowed.gt(
              BigNumber(0.1).times(
                BigNumber(10).pow(marketConfiguration.baseTokenDecimals)
              )
            )
          }
        >
          Earn
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
