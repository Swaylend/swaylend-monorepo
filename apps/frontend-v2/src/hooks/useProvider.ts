import { initProvider } from '@/utils/provider';
import type { Provider } from 'fuels';
import { useEffect, useState } from 'react';

export const useProvider = () => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initProvider().then((p) => setProvider(p));
  }, []);

  return provider;
};
