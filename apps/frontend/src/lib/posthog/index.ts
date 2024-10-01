import { useMutation } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';

export const useTrackExternalPageView = () => {
  const posthog = usePostHog();

  return useMutation({
    mutationKey: ['trackExternalPageView'],
    mutationFn: async (url: string) => {
      if (posthog) {
        posthog.capture('External Page View', {
          url: url,
        });
      }
    },
  });
};
