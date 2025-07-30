import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MARKET_MODE, useMarketStore } from '@/stores/market-store';

export const MarketSwitch = () => {
  const marketMode = useMarketStore.use.marketMode();
  const changeMarketMode = useMarketStore.use.changeMarketMode();

  const handleChange = (value: any) => {
    changeMarketMode(value);
  };

  return (
    <Tabs
      onValueChange={handleChange}
      defaultValue={marketMode}
      className="mt-[40px] sm:mt-[55px] block lg:hidden"
    >
      <TabsList className="h-[50px] rounded-full w-[280px]">
        <TabsTrigger
          value="borrow"
          className="cursor-pointer rounded-full max-sm:py-1.5 max-sm:px-6 dark:data-[state=active]:bg-purple text-white dark:text-white text-md font-bold"
        >
          Borrow
        </TabsTrigger>
        <TabsTrigger
          className="cursor-pointer rounded-full max-sm:py-1.5 max-sm:px-6 text-md dark:data-[state=active]:bg-primary text-white dark:text-white dark:data-[state=active]:text-primary-foreground font-bold"
          value="lend"
        >
          Earn
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
