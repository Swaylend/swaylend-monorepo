import { ErrorToast, InfoToast } from '@/components/Toasts';
import { appConfig } from '@/configs';
import { useReferralModalStore } from '@/stores/referralModalStore';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const getMessage = (inviteCode: string) => {
  return `I want to redeem invite code ${inviteCode}.`;
};

export const useRedeemInvite = () => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const { setOpen } = useReferralModalStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['redeemInvite', account],
    mutationFn: async (inviteCode: string) => {
      if (!account || !wallet) return null;

      const signature = await wallet.signMessage(getMessage(inviteCode));

      const response = await fetch(
        `${appConfig.client.swaylendApi}/api/referrals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inviteCode,
            signature,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to redeem invite code');
      }

      return null;
    },
    onSuccess: () => {
      InfoToast({ title: 'Success!', description: 'Invite code redeemed' });
      setOpen(false);
    },
    onError: (error) => {
      ErrorToast({ error: error.message });
      if (error.message === 'A predicate account cannot sign messages') {
        setOpen(false);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user', account],
      });
    },
  });
};
