import { useIsConnected } from '@fuels/react';
import { useHover } from '@mantine/hooks';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks/v1';
import { cn } from '@/lib/utils';
import POINTS from '/public/icons/points-icon.svg?url';
import { Button } from '../ui/button';

export const Points = () => {
  const { hovered, ref } = useHover();

  const [isManualOpen, setIsManualOpen] = useState(false);

  const { data: user } = useUser();
  // const { data: lmRewards } = useLMRewards();

  const { isConnected } = useIsConnected();

  return (
    <Popover open={hovered || isManualOpen}>
      <PopoverTrigger
        className="focus-visible:outline-hidden"
        onClick={() => setIsManualOpen(true)}
        ref={ref}
      >
        <Image
          alt="points-icon"
          className="cursor-pointer"
          height={40}
          src={POINTS}
          width={40}
        />
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="flex w-[258px] flex-col items-center gap-y-2 px-[24px]"
        onInteractOutside={() => setIsManualOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        sideOffset={8}
      >
        <div className="flex w-full flex-col items-center gap-y-2 rounded-xl border border-white/10 p-2">
          <div className="text-primary">SwayPoints</div>
          <div className={cn('font-semibold text-lavender')}>
            {isConnected ? (user ? user.points : '0') : 'Connect Wallet'}
          </div>
        </div>
        <Link className="mt-4 w-full" href="/leaderboard" prefetch={false}>
          <Button className="flex w-full gap-x-2" variant="tertiary-card">
            <Trophy className="h-5 w-5" />
            Points Leaderboard
          </Button>
        </Link>

        {/* {isConnected && (
          <div className="flex flex-col mt-4 gap-y-2 items-center border border-white/10 w-full p-2 rounded-xl">
            <div className="text-primary">Fuel Rewards</div>
            <div className={cn('text-lavender font-semibold')}>
              Season 1 - Part 1
            </div>
            <div className="text-[#F4B845] text-lg font-semibold">
              {lmRewards ? lmRewards.part_1 : 'Calculating'}
            </div>
            <div className={cn('text-lavender font-semibold')}>
              Season 1 - Part 2
            </div>
            <div className="text-[#F4B845] text-lg font-semibold">
              {lmRewards ? lmRewards.part_2 : 'Calculating'}
            </div>
          </div>
        )} */}
      </PopoverContent>
    </Popover>
  );
};
