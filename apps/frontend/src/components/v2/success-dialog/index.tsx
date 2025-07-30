import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { ArrowUpRightIcon, CheckCircleIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { appConfig } from '@/configs';
import { cn } from '@/lib/utils';
import { ACTION_TYPE, useMarketStore } from '@/stores/market-store';

export const SuccessDialog = () => {
  const action = useMarketStore.use.action();
  const open = useMarketStore.use.successDialogOpen();
  const setOpen = useMarketStore.use.changeSuccessDialogOpen();
  const successDialogTransactionId =
    useMarketStore.use.successDialogTransactionId();

  const actionText = useMemo(() => {
    if (action === ACTION_TYPE.SUPPLY) {
      return 'Supply Completed';
    }
    if (action === ACTION_TYPE.WITHDRAW) {
      return 'Withdrawal Completed';
    }
    if (action === ACTION_TYPE.BORROW) {
      return 'Borrow Completed';
    }
    if (action === ACTION_TYPE.REPAY) {
      return 'Repayment Completed';
    }
  }, [action]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent
        className="max-w-[400px] bg-popover p-0 max-sm:w-[90%] max-sm:rounded-xl"
        showCloseButton={false}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Transaction Successful</DialogTitle>
        </VisuallyHidden.Root>
        <div className="h-full w-full">
          <div className="relative flex h-[64px] w-full items-center justify-center font-semibold text-lg">
            Transaction Successful
            <div
              className={cn(
                '-z-10 absolute top-[62px] left-[calc(10%)] h-[2px] w-[80%] rounded-full bg-linear-to-r from-popover via-primary to-popover'
              )}
            />
            <div
              className={cn(
                '-z-10 absolute top-[56px] left-[calc(30%)] h-8 w-[40%] rounded-full bg-primary blur-xl'
              )}
            />
          </div>
          <div className="flex w-full flex-col items-center rounded-b-xl bg-card p-4 pt-12">
            <div>
              <CheckCircleIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="mt-4 font-semibold text-lg">{actionText}</div>

            <a
              className="mt-12 flex cursor-pointer items-center gap-x-2 font-normal text-moon"
              href={`${appConfig.client.shared.fuelExplorerUrl}/tx/${successDialogTransactionId}`}
              rel="noreferrer"
              target="_blank"
            >
              Explorer <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
