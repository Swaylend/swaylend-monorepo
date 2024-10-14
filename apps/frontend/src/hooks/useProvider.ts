import { appConfig } from '@/configs';
import { useNetworkProvider } from '@fuels/react';

export const useProvider = () => {
  const networkQueryData = useNetworkProvider({
    networkUrl: appConfig.client.fuelNodeUrl,
  });

  return { provider: networkQueryData.networkProvider };
};
