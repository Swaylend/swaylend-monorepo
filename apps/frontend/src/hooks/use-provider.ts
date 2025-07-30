import { useProvider as useFuelProvider } from '@fuels/react';
import { Provider } from 'fuels';
import { useEffect, useState } from 'react';
import { appConfig } from '@/configs';

export const useProvider = () => {
  const [customProvider, setCustomProvider] = useState<Provider | null>(null);
  const { provider } = useFuelProvider();

  useEffect(() => {
    setCustomProvider(new Provider(appConfig.client.shared.fuelNodeUrl));
  }, []);

  return { provider: provider ?? customProvider };
};
