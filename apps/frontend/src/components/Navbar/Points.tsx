import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLMRewards, useUser } from '@/hooks';
import { cn } from '@/lib/utils';
import { useIsConnected } from '@fuels/react';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useHover } from 'usehooks-ts';
import POINTS from '/public/icons/points-icon.svg?url';
import { Button } from '../ui/button';

export const Points = () => {
  const hoverRef = useRef<HTMLButtonElement | null>(null);
  const isHover = useHover(hoverRef);

  const [isManualOpen, setIsManualOpen] = useState(false);

  const { data: user } = useUser();
  const { data: lmRewards } = useLMRewards();

  const { isConnected } = useIsConnected();

  return (
    <Popover open={isHover || isManualOpen}>
      <PopoverTrigger
        className="focus-visible:outline-none"
        ref={hoverRef}
        onClick={() => setIsManualOpen(true)}
      >
        <Image alt="points-icon" width={40} height={40} src={POINTS} />
      </PopoverTrigger>
      <PopoverContent
        onInteractOutside={() => setIsManualOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        sideOffset={8}
        align="center"
        className="flex flex-col gap-y-2 items-center w-[258px] px-[24px]"
      >
        <div className="flex flex-col gap-y-2 items-center border border-white/10 w-full p-2 rounded-xl">
          <div className="text-primary">SwayPoints</div>
          <div className={cn('text-lavender font-semibold')}>
            {isConnected ? (user ? user.points : '0') : 'Connect Wallet'}
          </div>
        </div>
        <Link href="/leaderboard" className="w-full mt-4" prefetch={false}>
          <Button className="w-full flex gap-x-2" variant="tertiary-card">
            <Trophy className="w-5 h-5" />
            Points Leaderboard
          </Button>
        </Link>

        <div className="flex flex-col mt-4 gap-y-2 items-center border border-white/10 w-full p-2 rounded-xl">
          <div className="text-primary">Fuel Rewards</div>
          <div className={cn('text-lavender font-semibold')}>
            Season 1 - Part 1
          </div>
          <div className="text-[#F4B845] text-lg font-semibold">
            {lmRewards ? lmRewards.part_1 : 'Calculating'}
          </div>
        </div>
        <div className="px-1 text-[10px] italic text-moon">
          <div className="">
            <span className="font-semibold">Disclaimer</span>: Fuel Rewards will
            be visible after the distribution:
          </div>
          <div className=" w-full mt-2 flex justify-center">
            <div>
              <div>
                - <span className="font-semibold">After Day 30</span>: Initial
                distribution of rewards.
              </div>
              <div>
                - <span className="font-semibold">End of Day 45</span>: Final
                distribution of rewards.
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
