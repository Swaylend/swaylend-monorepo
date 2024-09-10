'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMarketStore } from '@/stores';
import type { DeployedMarket } from '@/utils';
import { SelectGroup, SelectLabel } from '@radix-ui/react-select';
import Image from 'next/image';
import FUEL from '/public/icons/fuel-logo.svg?url';
import USDC from '/public/tokens/usdc.svg?url';
import USDT from '/public/tokens/usdt.svg?url';

const MarketItem = ({ market, logo }: { market: string; logo: any }) => {
  return (
    <div className="flex gap-x-2 items-center">
      <div className="flex items-center">
        <div className="bg-neutral6 min-w-[32px] h-[32px] rounded-full flex items-center justify-center">
          <Image
            src={FUEL}
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
          className={'rounded-full -ml-2 ring-background ring-4'}
        />
      </div>
      <div className="text-neutral4">Fuel</div>
      <div className="font-semibold text-md">{market}</div>
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
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={
            <MarketItem
              market={market}
              logo={market === 'USDC' ? USDC : USDT} // TODO: Extract to function/maybe constants
            />
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fuel Network</SelectLabel>
          <SelectItem value="USDC">
            <MarketItem market="USDC" logo={USDC} />
          </SelectItem>
          <SelectItem value="USDT">
            <MarketItem market="USDT" logo={USDT} />
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
