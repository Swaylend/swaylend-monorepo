import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMemo, useState } from 'react';
import { useRedeemInvite } from '@/hooks';
import { cn } from '@/lib/utils';
import { useReferralModalStore } from '@/stores/referral-modal-store';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';

export const RedeemReferralDialog = () => {
  const open = useReferralModalStore.use.open();
  const setOpen = useReferralModalStore.use.setOpen();
  const { mutate: redeemInvite, isError, error, isPending } = useRedeemInvite();
  const [inviteCode, setInviteCode] = useState('');

  const isPredicateError = useMemo(() => {
    return error?.message === 'A predicate account cannot sign messages';
  }, [error]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-[400px] p-0 max-sm:w-[90%] max-sm:rounded-xl">
        <VisuallyHidden.Root asChild>
          <DialogTitle>Redeem Referral Code</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full">
          <div className="relative w-full overflow-hidden">
            <div
              className={cn(
                '-z-10 absolute top-[62px] left-[calc(5%)] h-2 w-[90%] bg-linear-to-r from-popover via-primary to-popover'
              )}
            />
            <div
              className={cn(
                '-z-10 absolute top-[61px] left-[calc(33%)] h-8 w-[33%] rounded-full bg-primary blur-2xl'
              )}
            />
            <div className="flex h-16 w-full items-center justify-center text-lg">
              <div className="font-semibold text-lavender text-lg">
                Redeem Referral Code
              </div>
            </div>
          </div>
          <div className="z-10 flex h-[calc(100%-68px)] w-full flex-col gap-y-[30px] bg-popover p-[16px] pt-[30px]">
            <div className="flex w-full flex-col gap-y-2.5">
              <Input
                className={cn(
                  'h-[56px] bg-card',
                  isError && !isPredicateError && 'border-[#FF0606]'
                )}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter referral code"
                value={inviteCode}
              />
              {isError && !isPredicateError && (
                <p className="text-[#FF0606]">Incorrect referral code</p>
              )}
            </div>
            <div className="flex w-full gap-x-[10px]">
              <Button
                className="h-10 w-1/2"
                onMouseDown={() => setOpen(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                className="h-10 w-1/2"
                disabled={isPending || inviteCode.length !== 8}
                onMouseDown={() => redeemInvite(inviteCode)}
                variant="default"
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
