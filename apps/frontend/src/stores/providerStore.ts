import { initProvider } from '@/utils';
import type { Provider } from 'fuels';
import { createWithEqualityFn } from 'zustand/traditional';

interface ProviderStore {
  provider: Provider | undefined;
  changeProvider: (provider: Provider) => void;
}

export const providerStoreInitialState = {
  provider: undefined,
};

export const useProviderStore = createWithEqualityFn<ProviderStore>()(
  (set) => ({
    ...providerStoreInitialState,
    changeProvider: (provider: Provider) => set({ provider }),
  })
);

initProvider()
  .then((provider) => useProviderStore.setState({ provider }))
  .catch((err) => console.error('Failed to initialize provider:', err));

export const selectProvider = (state: ProviderStore) => state.provider;
