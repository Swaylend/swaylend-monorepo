'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appConfig } from '@/configs';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores';
import { SYMBOL_TO_ICON } from '@/utils';
import { SelectGroup, SelectLabel } from '@radix-ui/react-select';
import Image from 'next/image';

const MarketItem = ({
  market,
  logo,
  selected,
}: { market: string; logo: any; selected?: boolean }) => {
  return (
    <div className="flex gap-x-2 w-full items-center justify-center px-2 cursor-pointer">
      <div className="flex items-center">
        <div className="bg-white/10 min-w-[32px] h-[32px] rounded-full flex items-center justify-center">
          <Image
            src={SYMBOL_TO_ICON.FUEL}
            alt="FUEL"
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
        <Image
          src={logo}
          alt={market}
          width={32}
          height={32}
          className="rounded-full -ml-2 ring-background ring-4"
        />
      </div>

      <div className={cn(selected && 'hidden xl:block', 'text-moon')}>Fuel</div>
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
  const { market, changeMarket } = useMarketStore();

  const handleChange = (value: string) => {
    changeMarket(value);
  };

  return (
    <Select value={market} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue>
          <MarketItem
            selected={true}
            market={market}
            logo={SYMBOL_TO_ICON[market]}
          />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.keys(appConfig.markets).map((market) => {
            return (
              <SelectItem key={market} value={market}>
                <MarketItem market={market} logo={SYMBOL_TO_ICON[market]} />
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
