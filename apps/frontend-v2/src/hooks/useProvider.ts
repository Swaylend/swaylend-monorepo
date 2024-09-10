import { useProviderStore } from '@/stores';
import { initProvider } from '@/utils/provider';
import type { Provider } from 'fuels';
import { useEffect, useState } from 'react';

let initializationPromise: Promise<Provider> | null = null;

export const useProvider = () => {
  const { provider, changeProvider } = useProviderStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (provider === null && !isLoading) {
      setIsLoading(true);

      if (!initializationPromise) {
        initializationPromise = initProvider();
      }

      initializationPromise
        .then((p) => changeProvider(p))
        .finally(() => setIsLoading(false));
    }
  }, [provider, changeProvider]);

  return provider;
};
