import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks';
import { useFuelPoints } from '@/hooks/useFuelPoints';
import { cn } from '@/lib/utils';
import { useReferralModalStore } from '@/stores/referralModalStore';
import { useIsConnected } from '@fuels/react';
import { Copy, Loader, Sparkle, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import POINTS from '/public/icons/points-icon.svg?url';
import { Button } from '../ui/button';
import { InfoIcon } from '../InfoIcon';

export const Points = () => {
  // const { setOpen } = useReferralModalStore();

  // const { data: user, isPending, isLoading, isError, refetch } = useUser();

  // const [isCopied, setIsCopied] = useState(false);

  const { isConnected } = useIsConnected();

  const { data: fuelPoints } = useFuelPoints();

  // const handleCopy = async (value: string) => {
  //   setIsCopied(true);
  //   await navigator.clipboard.writeText(value);
  //   setTimeout(() => {
  //     setIsCopied(false);
  //   }, 1000);
  // };

  return (
    <Popover>
      <PopoverTrigger>
        {/* <div className="text-yellow-400 sm:px-3 sm:py-1.5 max-sm:p-1 flex items-center gap-x-1 rounded-full border-[3px] border-yellow-400">
          <span className="max-sm:hidden">Coming Soon</span>
          </div> */}
        <Image alt="points-icon" width={32} height={32} src={POINTS} />
      </PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        align="center"
        className="flex flex-col gap-y-2 items-center w-[258px] px-[24px]"
      >
        <div className="flex flex-col gap-y-2 items-center border border-white/10 w-full p-2 rounded-xl">
          <div className="text-lavender">SwayPoints</div>
          <div
            className={cn(
              'text-lg font-semibold text-yellow-400'
              // isLoading && 'animate-pulse'
            )}
          >
            Coming Soon
          </div>
        </div>
        <div className="rounded-full flex flex-col items-center justify-center text-primary mt-8">
          <div className="flex gap-x-1 items-center">
            Fuel Points
            <InfoIcon text="Points earned through the Fuel Points Program" />
          </div>
          <span className="text-lavender font-semibold">
            {isConnected ? fuelPoints : 'Connect Wallet'}
          </span>
        </div>
        {/* <Link href="/leaderboard" className="w-full mt-4">
          <Button className="w-full flex gap-x-2" variant="tertiary-card">
            <Trophy className="w-5 h-5" />
            Points Leaderboard
          </Button>
        </Link>
        <div className="w-full">
          <Button
            className={cn('w-full flex gap-x-2', isLoading && 'animate-pulse')}
            variant="tertiary-card"
            disabled={isPending}
            onMouseDown={async () => {
              if (isError || !user) return await refetch();
              await handleCopy(user.inviteCode);
            }}
          >
            {!isLoading && !isError && (
              <>
                <Copy className="w-5 h-5" />
                {isCopied ? 'Copied' : 'Copy referral code'}
              </>
            )}
            {isLoading && <Loader className="w-5 h-5 animate-spin" />}
            {!isPending && isError && 'Refresh'}
          </Button>
          {user?.redeemedInviteCode === false && (
            <Button
              className="w-full flex gap-x-2 mt-2"
              variant="tertiary-card"
              onMouseDown={() => setOpen(true)}
            >
              Redeem referral code
            </Button>
          )}
        </div> */}
      </PopoverContent>
    </Popover>
  );
};
