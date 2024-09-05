'use client';
import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useIsConnected,
} from '@fuels/react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, ClipboardCopyIcon } from 'lucide-react';

export const ConnectButton = () => {
  const { connect, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  if (isConnected && account) {
    return (
      <Popover>
        <PopoverTrigger>
          <div className="px-4 py-2 rounded-full flex gap-x-2 items-center bg-slate-700 text-neutral4 font-semibold">
            {`${account?.slice(0, 6)}...${account?.slice(-4)}`}

            <ChevronDown className="h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[260px] px-[25px]">
          <div className="flex justify-between items-center">
            <div className="text-neutral4">Wallet Balance</div>
            <ClipboardCopyIcon
              className="w-4 h-4 hover:opacity-80"
              onClick={async () => {
                await navigator.clipboard.writeText(account);
              }}
            />
          </div>
          <div className="text-primary01 text-2xl font-semibold mt-2">$613</div>
          <div className="mt-10">
            <Button
              className="w-full"
              variant={'destructive'}
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div>
      <Button disabled={isConnecting} onClick={connect}>
        {isConnected
          ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
          : isConnecting
            ? 'Connecting'
            : 'Connect Wallet'}
      </Button>
    </div>
  );
};
