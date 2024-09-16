import { SWAYLEND_API } from '@/utils';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const getMessage = (inviteCode: string) => {
  return `I want to redeem invite code ${inviteCode}.`;
};

export const useRedeemInvite = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();

  return useMutation({
    mutationKey: ['redeemInvite', account],
    mutationFn: async (inviteCode: string) => {
      if (!account || !wallet) return null;

      const signature = await wallet.signMessage(getMessage(inviteCode));

      const response = await fetch(`${SWAYLEND_API}/api/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem invite code');
      }

      return null;
    },
    onSuccess: () => {
      toast.success('Invite code redeemed');
    },
  });
};
