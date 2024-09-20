'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores';
import { type DeployedMarket, SYMBOL_TO_ICON } from '@/utils';
import { SelectGroup, SelectLabel } from '@radix-ui/react-select';
import Image from 'next/image';

const MarketItem = ({
  market,
  logo,
  selected,
}: { market: string; logo: any; selected?: boolean }) => {
  return (
    <div className="flex gap-x-2 w-full items-center justify-center px-2">
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
        className={cn(selected && 'hidden xl:block', 'font-semibold text-md')}
      >
        {market}
      </div>
    </div>
  );
};

export const MarketSwitcher = () => {
  const { market, changeMarket } = useMarketStore();

  const handleChange = (value: string) => {
    changeMarket(value as DeployedMarket);
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
          <SelectLabel>Fuel Network</SelectLabel>
          <SelectItem value="USDC">
            <MarketItem market="USDC" logo={SYMBOL_TO_ICON.USDC} />
          </SelectItem>
          <SelectItem value="USDT">
            <MarketItem market="USDT" logo={SYMBOL_TO_ICON.USDT} />
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
