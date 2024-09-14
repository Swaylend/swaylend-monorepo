'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useIsConnected,
} from '@fuels/react';
import { ChevronDown, Copy } from 'lucide-react';

export const ConnectButton = () => {
  const { connect, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  if (isConnected && account) {
    return (
      <Popover>
        <PopoverTrigger>
          <div className="px-4 py-2 rounded-full max-xl:hidden flex gap-x-2 items-center bg-secondary text-moon font-semibold">
            {`${account?.slice(0, 6)}...${account?.slice(-4)}`}

            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="px-4 py-2 rounded-full xl:hidden flex gap-x-2 items-center bg-secondary text-moon font-semibold">
            {`${account?.slice(0, 4)}...${account?.slice(-2)}`}

            <ChevronDown className="h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[260px] px-[25px]">
          <div className="w-full">
            <div>
              <div className="text-moon text-sm">Connected Wallet</div>
              <div className="text-lg font-medium flex items-center justify-between w-full">
                <div className="flex gap-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {`${account?.slice(0, 6)}...${account?.slice(-4)}`}
                </div>
                <Copy
                  className="w-4 h-4 hover:opacity-80"
                  onMouseDown={async () => {
                    await navigator.clipboard.writeText(account);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-moon text-sm">Wallet Balance</div>
          </div>
          <div className="text-primary text-xl font-semibold">$613</div>
          <div className="mt-10">
            <Button
              className="w-full"
              variant="destructive"
              onMouseDown={() => disconnect()}
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
      <Button disabled={isConnecting} onMouseDown={connect}>
        {isConnected && account
          ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
          : isConnecting
            ? 'Connecting'
            : 'Connect Wallet'}
      </Button>
    </div>
  );
};
