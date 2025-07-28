import { appConfig } from '@/configs';
import { Airdrop, useAirdrops } from '@/hooks/useAirdrops';
import { useClaimAirdrop } from '@/hooks/useClaimAirdrop';
import { useIsAirdropClaimed } from '@/hooks/useIsAirdropClaimed';
import {
  useCollateralConfigurations,
  useLMRewards,
  useMarketConfiguration,
} from '@/hooks/v1';
import { cn } from '@/lib/utils';
import { SYMBOL_TO_ICON } from '@/utils';
import { useWallet } from '@fuels/react';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

const OldRewrdCard = ({
  totalAmount,
  token,
  userAmount,
  distributionDate,
}: {
  totalAmount: string;
  token: string;
  userAmount: string;
  distributionDate: string;
}) => {
  const tokenSymbol = appConfig.assets[token];

  return (
    <Card className="bg-card text-card-foreground border border-purple/20">
      <CardHeader className="p-4">
        <div className="text-lg font-semibold mb-2">Reward</div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple/20">
            <div className="w-5 h-5 relative">
              <Image
                src={SYMBOL_TO_ICON[tokenSymbol]}
                alt={`${tokenSymbol} logo`}
                layout="fill"
                className="rounded-full"
              />
            </div>
          </div>
          <span className="text-base">{tokenSymbol}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distribution</span>
            <span>Airdrop</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span>{totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your rewards</span>
            <span>{userAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End date</span>
            <span>{dayjs(distributionDate).format('DD/MM/YYYY')}</span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span>Campaign status:</span>
              <span className="text-purple">Completed</span>
            </div>
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

const RewardCard = ({ data }: { data: Airdrop }) => {
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
    return <Skeleton className="w-full h-[200px]" />;
  }

  if (!marketConfiguration || !collateralConfigurations) {
    return null;
  }

  const isEligible = data.isEligible.isEligible;
  const tokenDecimals =
    data.token === marketConfiguration.baseToken.bits
      ? marketConfiguration.baseTokenDecimals
      : collateralConfigurations[data.token].decimals;

  const amount = BigNumber(data.isEligible.amount)
    .div(10 ** tokenDecimals)
    .toFixed();

  const totalAmount = BigNumber(data.totalAmount)
    .minus(1)
    .div(10 ** tokenDecimals)
    .toFixed();

  const tokenSymbol = appConfig.assets[data.token];

  return (
    <Card
      className={cn(
        'bg-card text-card-foreground border',
        status === 'Active' ? 'border-primary/20' : 'border-purple/20'
      )}
    >
      <CardHeader className="p-4">
        <div className="text-lg font-semibold mb-2">Reward</div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center',
              status === 'Active' ? 'bg-primary/20' : 'bg-purple/20'
            )}
          >
            <div className="w-5 h-5 relative">
              <Image
                src={SYMBOL_TO_ICON[tokenSymbol]}
                alt={`${tokenSymbol} logo`}
                layout="fill"
                className="rounded-full"
              />
            </div>
          </div>
          <span className="text-base">{appConfig.assets[data.token]}</span>
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
            <div className="flex justify-between items-center mb-2">
              <span>Campaign status:</span>
              <span
                className={status === 'Active' ? 'text-primary' : 'text-purple'}
              >
                {status}
              </span>
            </div>
            <button
              type="button"
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
              className={cn(
                'w-full py-1.5 rounded-md transition-colors text-sm',
                status !== 'Active' && 'opacity-50 cursor-not-allowed',
                status === 'Active'
                  ? isAirdropClaimed
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-purple/10 text-purple hover:bg-purple/20'
              )}
            >
              {isClaimingAirdrop ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Claiming...</span>
                </div>
              ) : status === 'Active' || status === 'Completed' ? (
                !wallet?.address ? (
                  'Connect wallet'
                ) : !data.isEligible.isEligible ? (
                  'Not eligible'
                ) : isAirdropClaimed ? (
                  'Already claimed'
                ) : status === 'Active' ? (
                  'Claim'
                ) : (
                  'Not claimed'
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
  const { data: lmRewards, isPending: isLMRewardsPending } = useLMRewards();

  // if (isPending || isLMRewardsPending) {
  if (isLMRewardsPending) {
    return (
      <div className="w-full p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="w-full h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <OldRewrdCard
        totalAmount="7400000"
        token="0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82"
        userAmount={lmRewards?.part_1 ?? '0'}
        distributionDate="2025-02-17"
      />
      <OldRewrdCard
        totalAmount="65000000"
        token="0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82"
        userAmount={lmRewards?.part_2 ?? '0'}
        distributionDate="2025-03-01"
      />
      {/* {airdrops?.map((data) => (
        <RewardCard key={data.id} data={data} />
      ))} */}
    </div>
  );
};
