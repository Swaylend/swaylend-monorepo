import { initProvider } from '@/utils';
import type { Provider } from 'fuels';
import { create } from 'zustand';

interface ProviderStore {
  provider: Provider | undefined;
  changeProvider: (provider: Provider) => void;
}

export const providerStoreInitialState = {
  provider: undefined,
};

export const useProviderStore = create<ProviderStore>()((set) => ({
  ...providerStoreInitialState,
  changeProvider: (provider: Provider) => set({ provider }),
}));

initProvider()
  .then((provider) => useProviderStore.setState({ provider }))
  .catch((err) => console.error('Failed to initialize provider:', err));

export const selectProvider = (state: ProviderStore) => state.provider;
