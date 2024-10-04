import { appConfig } from '@/configs';
import { useBalance } from '@/hooks';
import { useAccount } from '@fuels/react';
import { ExternalLink } from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from '../ui/button';

export const FundWallet = ({
  setActiveStep,
}: { setActiveStep: (step: number) => void }) => {
  const handleNext = () => {
    setActiveStep(2);
  };

  const { account } = useAccount();

  const { data: ethBalance } = useBalance({
    address: account ?? undefined,
    assetId: appConfig.baseAssetId,
  });

  useEffect(() => {
    if (ethBalance?.gt(0)) {
      setActiveStep(2);
    }
  }, [ethBalance]);

  return (
    <div className="flex flex-col justify-between w-full h-full px-6 py-4 gap-y-2.5 rounded-md overflow-auto text-lavender">
      <div>
        <div className="text-center text-white font-semibold text-xl">
          Fund Wallet
        </div>
        <div className="mt-8">
          You currently have no Ethereum in your wallet. Ethereum on Fuel
          Network is required to use Swaylend. Get some Ethereum by bridging it
          from another Network, or by buying it directly.
        </div>
        <div className="flex gap-x-4 w-full justify-center mt-8">
          <Button className="flex gap-x-1 items-center">
            Buy Ethereum <ExternalLink className="w-4 h-4" />
          </Button>

          <Button className="flex gap-x-1 items-center">
            Bridge Ethereum <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="mt-16 flex w-full justify-end">
        <Button variant={'secondary'} onClick={handleNext}>
          Skip
        </Button>
      </div>
    </div>
  );
};
