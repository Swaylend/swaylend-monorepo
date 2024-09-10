import { useRedeemInvite } from '@/hooks';
import { cn } from '@/lib/utils';
import { useReferralModalStore } from '@/stores/referralModalStore';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

export const RedeemReferralDialog = () => {
  const { open, setOpen } = useReferralModalStore();
  const { mutate: redeemInvite, isError, isPending } = useRedeemInvite();
  const [inviteCode, setInviteCode] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-sm:w-[90%] max-sm:rounded-xl max-w-[400px]">
        <VisuallyHidden.Root asChild>
          <DialogTitle>Redeem Referral Code</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full">
          <div className="w-full overflow-hidden relative">
            <div
              className={cn(
                '-z-10 w-[90%] top-[62px] h-2 bg-gradient-to-r from-popover via-accent to-popover absolute left-[calc(5%)]'
              )}
            />
            <div
              className={cn(
                '-z-10 absolute blur-2xl top-[61px] left-[calc(33%)] rounded-full w-[33%] h-8 bg-primary01'
              )}
            />
            <div className="w-full text-lg h-16 flex items-center justify-center">
              <div className="text-neutral1 font-semibold text-lg">
                Redeem Referral Code
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-y-[30px] pt-[30px] h-[calc(100%-68px)] bg-popover p-[16px] z-10">
            <div className="w-full flex flex-col gap-y-2.5">
              <Input
                className={cn(
                  'h-[56px] bg-card',
                  isError && 'border-[#FF0606]'
                )}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter referral code"
              />
              {isError && (
                <p className="text-[#FF0606]">Incorrect referral code</p>
              )}
            </div>
            <div className="flex gap-x-[10px] w-full">
              <Button
                className="w-1/2 h-10"
                variant="tertiary"
                onMouseDown={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-1/2 h-10"
                variant="default"
                disabled={isPending || inviteCode.length !== 8}
                onMouseDown={() => redeemInvite(inviteCode)}
              >
                {isPending ? 'Redeeming...' : isError ? 'Try again' : 'Redeem'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
