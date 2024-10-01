import type { Provider } from 'fuels';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

interface ProviderStore {
  provider: Provider | null;
  changeProvider: (provider: Provider) => void;
}

export const providerStoreInitialState = {
  provider: null,
};

export const useProviderStore = createWithEqualityFn<ProviderStore>()(
  (set) => ({
    ...providerStoreInitialState,

    changeProvider: (provider: Provider) => set({ provider }),
  }),
  shallow
);
