import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks';
import { useFuelPoints } from '@/hooks/useFuelPoints';
import { cn } from '@/lib/utils';
import { useIsConnected } from '@fuels/react';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useHover } from 'usehooks-ts';
import POINTS from '/public/icons/points-icon.svg?url';
import { InfoIcon } from '../InfoIcon';
import { Button } from '../ui/button';

export const Points = () => {
  const hoverRef = useRef<HTMLButtonElement | null>(null);
  const isHover = useHover(hoverRef);

  const [isManualOpen, setIsManualOpen] = useState(false);

  const { data: user } = useUser();

  const { isConnected } = useIsConnected();

  const { data: fuelPoints } = useFuelPoints();

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
          <div className="text-primary">Swaypoints</div>
          <div className={cn('text-lavender font-semibold')}>
            {isConnected ? (user ? user.points : '0') : 'Connect Wallet'}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-y-2 items-center border border-white/10 w-full p-2 rounded-xl">
          <div className="flex gap-x-1 items-center text-primary">
            Fuel Points
            <InfoIcon text="Points earned through the Fuel Points Program" />
          </div>
          <span className="text-lavender font-semibold">
            {isConnected ? fuelPoints : 'Connect Wallet'}
          </span>
        </div>
        <Link href="/leaderboard" className="w-full mt-4" prefetch={false}>
          <Button className="w-full flex gap-x-2" variant="tertiary-card">
            <Trophy className="w-5 h-5" />
            Points Leaderboard
          </Button>
        </Link>
      </PopoverContent>
    </Popover>
  );
};
