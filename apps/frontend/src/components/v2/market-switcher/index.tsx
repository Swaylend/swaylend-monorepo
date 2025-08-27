'use client';
import { SelectGroup } from '@radix-ui/react-select';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appConfig } from '@/configs';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores/market-store';
import { SYMBOL_TO_ICON } from '@/utils';

const MarketItem = ({
  market,
  logo,
  selected,
}: {
  market: string;
  logo: any;
  selected?: boolean;
}) => {
  return (
    <div className="flex w-full cursor-pointer items-center justify-center gap-x-2 px-2">
      <div className="flex items-center">
        <div className="flex h-[32px] min-w-[32px] items-center justify-center rounded-full bg-white/10">
          <Image
            alt="FUEL"
            className="rounded-full"
            height={24}
            src={SYMBOL_TO_ICON.FUEL}
            width={24}
          />
        </div>
        <Image
          alt={market}
          className="-ml-2 rounded-full ring-4 ring-background"
          height={32}
          src={logo}
          width={32}
        />
      </div>

      <div className={cn(selected && 'hidden xl:block', 'text-md text-moon')}>
        Fuel
      </div>
      <div
        className={cn(
          selected && 'text-sm xl:text-md',
          'font-semibold text-md'
        )}
      >
        {market}
      </div>
    </div>
  );
};

export const MarketSwitcher = () => {
  const market = useMarketStore.use.market();
  const changeMarket = useMarketStore.use.changeMarket();

  const handleChange = (value: string) => {
    changeMarket(value);
  };

  return (
    <Select onValueChange={handleChange} value={market}>
      <SelectTrigger className="bg-background hover:cursor-pointer hover:bg-background dark:bg-background dark:hover:bg-background">
        <SelectValue>
          <MarketItem
            logo={SYMBOL_TO_ICON[market]}
            market={market}
            selected={true}
          />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.keys(appConfig.client.v2.markets).map((market) => {
            return (
              <SelectItem
                className="hover:cursor-pointer hover:bg-background dark:hover:bg-background"
                key={market}
                value={market}
              >
                <MarketItem logo={SYMBOL_TO_ICON[market]} market={market} />
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
