import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks';
import { useReferralModalStore } from '@/stores/referralModalStore';
import clsx from 'clsx';
import { Copy, Loader, Sparkle, Trophy } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';

export const Points = () => {
  const { setOpen } = useReferralModalStore();

  const { data: user, isPending, isLoading, isError, refetch } = useUser();

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (value: string) => {
    setIsCopied(true);
    await navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="text-yellow-400 sm:px-3 sm:py-1.5 max-sm:p-1 flex items-center gap-x-1 rounded-full border-[3px] border-yellow-400">
          <Sparkle className="w-5 h-5" />
          <span className="max-sm:hidden">687</span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="flex flex-col gap-y-4 items-center w-[258px] px-[24px]"
      >
        <div className="flex flex-col gap-y-2 items-center">
          <div className="text-neutral5">SwayLend Pts</div>
          <div
            className={clsx(
              'text-2xl font-semibold text-yellow-400',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? 'Loading...' : user ? user.points : '0'}
          </div>
        </div>
        <div className="rounded-full bg-white/5 px-4 py-2 text-neutral5">
          Fuel Pts <span className="text-neutral2">27</span>
        </div>
        <Button className="w-full flex gap-x-2" variant="tertiary-card">
          <Trophy className="w-5 h-5" />
          Points Leaderboard
        </Button>
        <Button
          className={clsx('w-full flex gap-x-2', isLoading && 'animate-pulse')}
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
            className="w-full flex gap-x-2"
            variant="tertiary-card"
            onMouseDown={() => setOpen(true)}
          >
            Redeem referral code
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
