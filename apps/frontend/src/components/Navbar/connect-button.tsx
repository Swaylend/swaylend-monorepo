'use client';

import {
  useAccount,
  useConnectUI,
  useDisconnect,
  useIsConnected,
} from '@fuels/react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { appConfig } from '@/configs';
import { CopyIcon } from '../v1/copy-icon';

export const ConnectButton = () => {
  const { connect, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  if (isConnected && account) {
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex cursor-pointer items-center gap-x-2 rounded-full bg-secondary px-4 py-2 font-semibold text-moon max-xl:hidden">
            {`${account?.slice(0, 6)}...${account?.slice(-4)}`}

            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="flex cursor-pointer items-center gap-x-2 rounded-full bg-secondary px-4 py-2 font-semibold text-moon xl:hidden">
            {`${account?.slice(0, 4)}...${account?.slice(-2)}`}

            <ChevronDown className="h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[260px] px-[25px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="w-full">
            <div>
              <div className="text-moon text-sm">Connected Wallet</div>
              <div className="flex w-full items-center justify-between font-medium text-lg">
                <div className="flex items-center gap-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {`${account?.slice(0, 6)}...${account?.slice(-4)}`}
                </div>
                <CopyIcon value={account} />
              </div>
            </div>
          </div>
          <div className="mt-10">
            <a
              href={`${appConfig.client.shared.fuelExplorerUrl}/account/${account}`}
              rel="noreferrer"
              target="_blank"
            >
              <Button className="w-full" variant="secondary">
                View on Fuel Explorer
              </Button>
            </a>
            <Button
              className="mt-2 w-full"
              onMouseDown={() => disconnect()}
              variant="destructive"
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
