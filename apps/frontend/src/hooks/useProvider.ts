import { appConfig } from '@/configs';
import { useProvider as useFuelProvider } from '@fuels/react';
import { Provider } from 'fuels';
import { useEffect, useState } from 'react';

export const useProvider = () => {
  const [customProvider, setCustomProvider] = useState<Provider | null>(null);
  const { provider } = useFuelProvider();

  useEffect(() => {
    Provider.create(appConfig.client.fuelNodeUrl)
      .then((_provider) => setCustomProvider(_provider))
      .catch((error) => console.error(`Error creating provider: ${error}`));
  }, []);

  return { provider: provider ?? customProvider };
};
