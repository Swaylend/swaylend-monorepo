'use client';

import {
  selectBanxaDialogOpen,
  selectBanxaDialogSetOpen,
  useBanxaDialogStore,
} from '@/stores/banxaDialogStore';
import { useAccount } from '@fuels/react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export const BanxaIframeDialog = () => {
  const { account } = useAccount();
  const open = useBanxaDialogStore(selectBanxaDialogOpen);
  const setOpen = useBanxaDialogStore(selectBanxaDialogSetOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-md:max-w-full max-w-[75%] w-full h-full md:h-[85vh] rounded-2xl border-0 flex flex-col">
        <DialogClose asChild>
          <Button
            onMouseDown={() => setOpen(false)}
            className="absolute w-[30px] h-[30px] p-0 right-[9px] top-[9px]"
            variant="ghost"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Banxa</DialogTitle>
        </DialogHeader>
        {open && (
          <iframe
            title="Banxa"
            src={getBanxaUrl(account)}
            className="flex-1 w-full h-full"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const getBanxaUrl = (account: string | null) => {
  return `https://checkout.banxa.com/?coinType=ETH&fiatType=USD&fiatAmount=100&blockchain=FUEL${
    account ? `&walletAddress=${account}` : ''
  }`;
};
