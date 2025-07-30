import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketStore } from '@/stores/market-store';

export const MarketSwitch = () => {
  const marketMode = useMarketStore.use.marketMode();
  const changeMarketMode = useMarketStore.use.changeMarketMode();

  const handleChange = (value: any) => {
    changeMarketMode(value);
  };

  return (
    <Tabs
      className="mt-[40px] block sm:mt-[55px] lg:hidden"
      defaultValue={marketMode}
      onValueChange={handleChange}
    >
      <TabsList className="h-[50px] w-[280px] rounded-full">
        <TabsTrigger
          className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-purple"
          value="borrow"
        >
          Borrow
        </TabsTrigger>
        <TabsTrigger
          className="cursor-pointer rounded-full font-bold text-md text-white max-sm:px-6 max-sm:py-1.5 dark:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
          value="lend"
        >
          Earn
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
