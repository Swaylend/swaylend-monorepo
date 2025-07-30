import { useAccount } from '@fuels/react';
import { ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { appConfig } from '@/configs';
import { useBalance } from '@/hooks/v1';
import { Button } from '../../ui/button';

export const FundWallet = ({
  setActiveStep,
}: {
  setActiveStep: (step: number) => void;
}) => {
  const handleNext = () => {
    setActiveStep(2);
  };

  const { account } = useAccount();

  const { data: ethBalance } = useBalance({
    address: account ?? undefined,
    assetId: appConfig.client.shared.baseAssetId,
  });

  useEffect(() => {
    if (ethBalance?.gt(0)) {
      setActiveStep(2);
    }
  }, [ethBalance]);

  return (
    <div className="flex h-full w-full flex-col justify-between gap-y-2.5 overflow-auto rounded-md px-6 py-4 text-lavender">
      <div>
        <div className="text-center font-semibold text-white text-xl">
          Fund Wallet
        </div>
        <div className="mt-8">
          You currently have no Ethereum in your wallet. Ethereum on Fuel
          Network is required to use Swaylend. Get some Ethereum by bridging it
          from another Network, or by buying it directly.
        </div>
        <div className="mt-8 flex w-full justify-center gap-x-4">
          {/* <Button className="flex gap-x-1 items-center">
            Buy Ethereum <ExternalLink className="w-4 h-4" />
          </Button> */}

          <a
            href={`${appConfig.client.shared.fuelExplorerUrl}/bridge`}
            rel="noreferrer"
            target="_blank"
          >
            <Button className="flex items-center gap-x-1">
              Bridge Ethereum <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
      <div className="mt-16 flex w-full justify-end">
        <Button onClick={handleNext} variant={'secondary'}>
          Skip
        </Button>
      </div>
    </div>
  );
};
