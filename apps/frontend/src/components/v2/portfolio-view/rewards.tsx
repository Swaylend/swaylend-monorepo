import { useWallet } from '@fuels/react';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import Image from 'next/image';
import { appConfig } from '@/configs';
import type { Airdrop } from '@/hooks/use-airdrops';
import { useClaimAirdrop } from '@/hooks/use-claim-airdrop';
import { useIsAirdropClaimed } from '@/hooks/use-is-airdrop-claimed';
import {
  useCollateralConfigurations,
  useMarketConfiguration,
} from '@/hooks/v2';
import { cn } from '@/lib/utils';
import { SYMBOL_TO_ICON } from '@/utils';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

const _RewardCard = ({ data }: { data: Airdrop }) => {
  const status =
    new Date(data.endDate) < new Date()
      ? 'Completed'
      : new Date(data.startDate) > new Date()
        ? 'Upcoming'
        : 'Active';

  const { wallet } = useWallet();
  const { data: marketConfiguration, isPending: isMarketConfigurationPending } =
    useMarketConfiguration();

  const {
    data: collateralConfigurations,
    isPending: isCollateralConfigurationsPending,
  } = useCollateralConfigurations();

  const { data: isAirdropClaimed, isPending: isAirdropClaimedPending } =
    useIsAirdropClaimed(data.contractAddress, data.isEligible.treeIndex);

  const { mutate: claimAirdrop, isPending: isClaimingAirdrop } =
    useClaimAirdrop();

  // Return skeleton if pending
  if (
    isMarketConfigurationPending ||
    isCollateralConfigurationsPending ||
    isAirdropClaimedPending
  ) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (!(marketConfiguration && collateralConfigurations)) {
    return null;
  }

  const isEligible = data.isEligible.isEligible;
  const tokenDecimals =
    data.token === marketConfiguration.baseToken.bits
      ? marketConfiguration.baseTokenDecimals
      : collateralConfigurations[data.token].decimals;

  const amount = BigNumber(data.isEligible.amount)
    .div(10 ** tokenDecimals)
    .toFixed(0);

  const totalAmount = BigNumber(data.totalAmount)
    .minus(1)
    .div(10 ** tokenDecimals)
    .toFixed(0);

  const tokenSymbol = appConfig.client.shared.assets[data.token];

  return (
    <Card
      className={cn(
        'border bg-card text-card-foreground',
        status === 'Active' ? 'border-primary/20' : 'border-purple/20'
      )}
    >
      <CardHeader className="p-4">
        <div className="mb-2 font-semibold text-lg">Reward</div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full',
              status === 'Active' ? 'bg-primary/20' : 'bg-purple/20'
            )}
          >
            <div className="relative h-5 w-5">
              <Image
                alt={`${tokenSymbol} logo`}
                className="rounded-full"
                layout="fill"
                src={SYMBOL_TO_ICON[tokenSymbol]}
              />
            </div>
          </div>
          <span className="text-base">
            {appConfig.client.shared.assets[data.token]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distribution</span>
            <span>Claim</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span>{totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your rewards</span>
            <span>{isEligible ? amount : '0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start date</span>
            <span>{dayjs(data.startDate).format('DD/MM/YYYY HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End date</span>
            <span>{dayjs(data.endDate).format('DD/MM/YYYY HH:mm')}</span>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between">
              <span>Campaign status:</span>
              <span
                className={status === 'Active' ? 'text-primary' : 'text-purple'}
              >
                {status}
              </span>
            </div>
            <button
              className={cn(
                'w-full rounded-md py-1.5 text-sm transition-colors',
                status !== 'Active' && 'cursor-not-allowed opacity-50',
                status === 'Active'
                  ? isAirdropClaimed
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-purple/10 text-purple hover:bg-purple/20'
              )}
              disabled={
                status !== 'Active' || isAirdropClaimed || isClaimingAirdrop
              }
              onClick={() => {
                if (isEligible && !isAirdropClaimed && wallet?.address) {
                  claimAirdrop({
                    contractAddress: data.contractAddress,
                    address: wallet?.address.b256Address,
                  });
                }
              }}
              type="button"
            >
              {isClaimingAirdrop ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Claiming...</span>
                </div>
              ) : status === 'Active' || status === 'Completed' ? (
                wallet?.address ? (
                  data.isEligible.isEligible ? (
                    isAirdropClaimed ? (
                      'Already claimed'
                    ) : status === 'Active' ? (
                      'Claim'
                    ) : (
                      'Not claimed'
                    )
                  ) : (
                    'Not eligible'
                  )
                ) : (
                  'Connect wallet'
                )
              ) : (
                'Coming soon'
              )}
            </button>
          </div>
          {/* <div className="text-center text-xs mt-3">
            <span className="text-muted-foreground">
              Check the Fuel token rewards{' '}
            </span>
            <a
              href={'https://google.com'}
              className={cn(
                'hover:underline',
                status === 'Active' ? 'text-primary' : 'text-purple'
              )}
            >
              Terms of Service
            </a>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
};

export const Rewards = () => {
  // const { data: airdrops, isPending } = useAirdrops();

  // if (isPending) {

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* {airdrops?.map((data) => (
        <RewardCard key={data.id} data={data} />
      ))} */}
    </div>
  );
};
