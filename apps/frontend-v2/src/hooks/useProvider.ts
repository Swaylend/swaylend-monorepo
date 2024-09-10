import { useProviderStore } from '@/stores';
import { initProvider } from '@/utils/provider';
import type { Provider } from 'fuels';
import { useEffect } from 'react';

let initializationPromise: Promise<Provider> | null = null;

export const useProvider = () => {
  const { provider, changeProvider } = useProviderStore();

  useEffect(() => {
    if (provider === null && !initializationPromise) {
      initializationPromise = initProvider();

      initializationPromise
        .then((p) => {
          changeProvider(p);
        })
        .finally(() => {
          initializationPromise = null;
        });
    }
  }, [provider]);

  return provider;
};
