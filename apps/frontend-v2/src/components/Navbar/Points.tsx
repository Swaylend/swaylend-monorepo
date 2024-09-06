import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Copy, Sparkle, Trophy } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

export const Points = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="text-yellow-400 px-3 py-1.5 flex items-center gap-x-1 rounded-full border-[2px] border-yellow-400">
          <Sparkle className="w-5 h-5" />
          687
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="flex flex-col gap-y-4 items-center w-[258px] px-[24px]"
      >
        <div className="flex flex-col gap-y-2 items-center">
          <div className="text-neutral5">SwayLend Pts</div>
          <div className="text-2xl font-semibold text-yellow-400">687</div>
        </div>
        <div className="rounded-full bg-white/5 px-4 py-2 text-neutral5">
          Fuel Pts <span className="text-neutral2">27</span>
        </div>
        <Button className="w-full flex gap-x-2" variant={'tertiary'}>
          <Trophy className="w-5 h-5" />
          Points Leaderboard
        </Button>
        <Button className="w-full flex gap-x-2" variant={'tertiary'}>
          <Copy className="w-5 h-5" /> Copy referral code
        </Button>
      </PopoverContent>
    </Popover>
  );
};
