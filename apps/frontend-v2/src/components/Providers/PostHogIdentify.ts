'use client';

import { useAccount, useFuel } from '@fuels/react';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useMemo } from 'react';

export default function PostHogIdentify(): null {
  const posthog = usePostHog();
  const { account } = useAccount();
  const { fuel } = useFuel();

  const currentConnector = useMemo(() => {
    if (!fuel) return null;
    return fuel.currentConnector();
  }, [fuel]);

  useEffect(() => {
    if (posthog && account && currentConnector) {
      posthog.identify(account, {
        connector: currentConnector.name,
      });
    }
  }, [account, posthog, currentConnector]);

  return null;
}
