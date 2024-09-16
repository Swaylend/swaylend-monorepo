'use client';

import { useAccount } from '@fuels/react';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export default function PostHogIdentify(): null {
  const posthog = usePostHog();
  const { account } = useAccount();

  useEffect(() => {
    if (posthog && account) {
      posthog.identify(account);
    }
  }, [account, posthog]);

  return null;
}
